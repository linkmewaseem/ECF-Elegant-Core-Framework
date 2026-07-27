import HttpKernelError from "./errors/HttpKernelError.js";
import Request from "./Request.js";
import Response from "./Response.js";
import Pipeline from "./Pipeline.js";

export default class HttpKernel {
    #bootstrapped = false;

    constructor(router, bodyParserManager, middlewareResolver, exceptionHandler = null, responseContext = {}, app = null) {
        this.validateRouter(router);
        this.validateBodyParserManager(bodyParserManager);
        this.validateMiddlewareResolver(middlewareResolver);
        this.validateExceptionHandler(exceptionHandler);

        this.router = router;
        this.bodyParserManager = bodyParserManager;
        this.middlewareResolver = middlewareResolver;
        this.exceptionHandler = exceptionHandler;
        this.responseContext = responseContext;
        this.app = app;
        this.globalMiddlewareList = [];
    }

    /**
     * Set global middleware running on all requests before route resolution.
     * @param {Array<Function|Object>} middleware 
     * @returns {this}
     */
    use(...middleware) {
        const flat = middleware.flat(Infinity);
        this.globalMiddlewareList.push(...flat);
        return this;
    }

    getGlobalMiddleware() {
        return [...this.globalMiddlewareList];
    }

    /**
     * Bootstrap the application and service providers (runs exactly once).
     */
    async bootstrap() {
        if (this.#bootstrapped) {
            return this;
        }

        if (this.app && typeof this.app.boot === "function" && !this.app.isBooted) {
            await this.app.boot();
        }

        this.#bootstrapped = true;
        return this;
    }

    get isBootstrapped() {
        return this.#bootstrapped;
    }

    /**
     * Handle an incoming raw HTTP request and response pair.
     * @param {Object} rawRequest Node IncomingMessage
     * @param {Object} rawResponse Node ServerResponse
     * @returns {Promise<Response>}
     */
    async handle(rawRequest, rawResponse) {
        await this.bootstrap();

        const request = new Request(rawRequest, this.bodyParserManager);
        const response = new Response(rawResponse, this.responseContext);

        const globalMiddleware = this.getGlobalMiddleware();
        let route = null;
        let routeMiddleware = [];

        try {
            const pipeline = new Pipeline();

            const finalResult = await pipeline
                .send(request, response)
                .through(globalMiddleware)
                .then(async (req, res) => {
                    route = this.router.match(req);
                    routeMiddleware = this.middlewareResolver.resolve(route);

                    const routePipeline = new Pipeline();
                    return await routePipeline
                        .send(req, res)
                        .through(routeMiddleware)
                        .then(async (r1, r2) => {
                            return route.handler(r1, r2);
                        });
                });

            const normalizedRes = await this.normalizeResponse(finalResult, request, response);

            if (!normalizedRes.headersSent) {
                normalizedRes.send();
            }

            await this.terminateMiddleware([...globalMiddleware, ...routeMiddleware], request, normalizedRes);

            return normalizedRes;
        } catch (error) {
            if (this.exceptionHandler) {
                return this.exceptionHandler.handle(error, request, response);
            }
            throw error;
        }
    }

    /**
     * Normalize controller/closure return values into a standard Response instance.
     */
    async normalizeResponse(result, request, response) {
        if (result instanceof Response) {
            return result;
        }

        if (response.headersSent) {
            return response;
        }

        if (typeof result === "string") {
            response.html(result);
            return response;
        }

        if (Buffer.isBuffer(result)) {
            response.send(result);
            return response;
        }

        if (typeof result === "object" && result !== null) {
            if (typeof result.render === "function") {
                const html = await result.render();
                response.html(html);
                return response;
            }
            response.json(result);
            return response;
        }

        return response;
    }

    /**
     * Execute terminating middleware hooks after response delivery.
     */
    async terminateMiddleware(middlewares, request, response) {
        for (const mw of middlewares) {
            try {
                if (mw && typeof mw.terminate === "function") {
                    await mw.terminate(request, response);
                }
            } catch (err) {
                if (this.exceptionHandler && typeof this.exceptionHandler.report === "function") {
                    this.exceptionHandler.report(err);
                }
            }
        }
    }

    // ---- Validation ----

    validateRouter(router) {
        if (!router || typeof router.match !== "function") {
            throw new HttpKernelError("HttpKernel requires a Router with a match() method.");
        }
    }

    validateBodyParserManager(bodyParserManager) {
        if (!bodyParserManager || typeof bodyParserManager.parse !== "function") {
            throw new HttpKernelError("HttpKernel requires a BodyParserManager with a parse() method.");
        }
    }

    validateMiddlewareResolver(middlewareResolver) {
        if (!middlewareResolver || typeof middlewareResolver.resolve !== "function") {
            throw new HttpKernelError("HttpKernel requires a MiddlewareResolver with a resolve() method.");
        }
    }

    validateExceptionHandler(exceptionHandler) {
        if (exceptionHandler && typeof exceptionHandler.handle !== "function") {
            throw new HttpKernelError("HttpKernel requires an ExceptionHandler with a handle() method.");
        }
    }
}