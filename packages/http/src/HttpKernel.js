import HttpKernelError from "./errors/HttpKernelError.js";
import Request from "./Request.js";
import Response from "./Response.js";
import Pipeline from "./Pipeline.js";

export default class HttpKernel {
    constructor(router, bodyParserManager, middlewareResolver, exceptionHandler = null, responseContext = {}) {
        this.validateRouter(router);
        this.validateBodyParserManager(bodyParserManager);
        this.validateMiddlewareResolver(middlewareResolver);
        this.validateExceptionHandler(exceptionHandler);

        this.router = router;
        this.bodyParserManager = bodyParserManager;
        this.middlewareResolver = middlewareResolver;
        this.exceptionHandler = exceptionHandler;
        this.responseContext = responseContext;
    }

    handle(rawRequest, rawResponse) {
        const request = new Request(rawRequest, this.bodyParserManager);
        const response = new Response(rawResponse, this.responseContext);

        try {
            const route = this.router.match(request);
            const middleware = this.middlewareResolver.resolve(route);
            const pipeline = new Pipeline();

            const result = pipeline
                .send(request, response)
                .through(middleware)
                .then((req, res) => route.handler(req, res));

            if (result && typeof result.then === "function") {
                return result.catch((error) => {
                    if (this.exceptionHandler) {
                        return this.exceptionHandler.handle(error, request, response);
                    }
                    throw error;
                });
            }

            return result;
        } catch (error) {
            if (this.exceptionHandler) {
                return this.exceptionHandler.handle(error, request, response);
            }
            throw error;
        }
    }

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