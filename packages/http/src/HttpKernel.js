import fs from "node:fs";
import path from "node:path";
import HttpKernelError from "./errors/HttpKernelError.js";
import Request from "./Request.js";
import Response from "./Response.js";
import Pipeline from "./Pipeline.js";

const STATIC_MIME_TYPES = {
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".map": "application/json"
};

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

        // Serve static assets from public/ directory if available
        const reqPath = request.path;
        if (reqPath && reqPath !== "/" && !reqPath.endsWith("index.js")) {
            const relativePath = reqPath.replace(/^\//, "");
            const publicDir = path.resolve(process.cwd(), "public");
            const publicPath = path.resolve(publicDir, relativePath);
            if (publicPath.startsWith(publicDir) && fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
                const ext = path.extname(publicPath).toLowerCase();
                const contentType = STATIC_MIME_TYPES[ext] || "application/octet-stream";
                const fileContent = fs.readFileSync(publicPath);
                response.status(200).header("Content-Type", contentType).send(fileContent);
                return response;
            }
        }

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
                return await this.handleException(error, request, response);
            }
            throw error;
        }
    }

    async normalizeResponse(result, request, defaultResponse) {
        if (result === defaultResponse) {
            return defaultResponse;
        }

        if (result instanceof Response) {
            return result;
        }

        if (typeof result === "string" || typeof result === "number" || typeof result === "boolean") {
            defaultResponse.html(String(result));
            return defaultResponse;
        }

        // Fix #2B: Buffer must be sent raw, not JSON-serialized
        if (Buffer.isBuffer(result)) {
            defaultResponse.send(result);
            return defaultResponse;
        }

        // Fix #2C: View-like objects (has render()) should produce text/html
        if (result !== null && typeof result === "object" && typeof result.render === "function") {
            const html = await result.render();
            defaultResponse.html(html);
            return defaultResponse;
        }

        if (result !== null && typeof result === "object") {
            defaultResponse.json(result);
            return defaultResponse;
        }

        return defaultResponse;
    }

    async handleException(error, request, response) {
        if (this.exceptionHandler) {
            try {
                const handledRes = await this.exceptionHandler.handle(error, request, response);
                if (handledRes instanceof Response) {
                    if (!handledRes.headersSent) {
                        handledRes.send();
                    }
                    return handledRes;
                }
            } catch (innerErr) {
                return this.fallbackErrorResponse(innerErr, response);
            }
        }

        return this.fallbackErrorResponse(error, response);
    }

    fallbackErrorResponse(error, response) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal Server Error";

        response.status(statusCode);
        response.html(`<h1>Error ${statusCode}</h1><p>${message}</p>`);

        if (!response.headersSent) {
            response.send();
        }

        return response;
    }

    async terminateMiddleware(middlewareList, request, response) {
        for (const mw of middlewareList) {
            if (mw && typeof mw.terminate === "function") {
                try {
                    await mw.terminate(request, response);
                } catch (err) {
                    // Fix #2D: report terminating middleware errors instead of silently swallowing them
                    if (this.exceptionHandler && typeof this.exceptionHandler.report === "function") {
                        this.exceptionHandler.report(err);
                    }
                }
            }
        }
    }

    validateRouter(router) {
        if (!router || typeof router.match !== "function") {
            throw new HttpKernelError("HttpKernel requires a valid Router instance.");
        }
    }

    validateBodyParserManager(manager) {
        if (!manager || typeof manager.parse !== "function") {
            throw new HttpKernelError("HttpKernel requires a valid BodyParserManager instance.");
        }
    }

    validateMiddlewareResolver(resolver) {
        if (!resolver || typeof resolver.resolve !== "function") {
            throw new HttpKernelError("HttpKernel requires a valid MiddlewareResolver instance.");
        }
    }

    validateExceptionHandler(handler) {
        if (handler !== null && typeof handler.handle !== "function") {
            throw new HttpKernelError("ExceptionHandler must have a handle(err, req, res) method.");
        }
    }
}