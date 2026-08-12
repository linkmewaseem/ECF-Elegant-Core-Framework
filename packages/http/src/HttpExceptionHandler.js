import HttpExceptionHandlerError from "./errors/HttpExceptionHandlerError.js";

export default class HttpExceptionHandler {
    constructor(exceptionManager) {
        this.validateExceptionManager(exceptionManager);
        this.manager = exceptionManager;
    }

    // ---- Public API ----

    handle(error, request, response) {
        this.reportIfRegistered(error);

        const renderer = this.manager.resolveRenderer(error);

        if (renderer) {
            return renderer(error, request, response);
        }

        return this.fallback(error, request, response);
    }

    // ---- Internal ----

    reportIfRegistered(error) {
        const reporter = this.manager.resolveReporter(error);
        if (reporter) {
            reporter(error);
        }
    }

    fallback(error, request, response) {
        console.error('[HttpExceptionHandler]', error);

        const status = error.status || error.statusCode || 500;
        const isDebug = process.env.NODE_ENV !== "production" && process.env.APP_DEBUG !== "false";

        if (request && typeof request.expectsJson === "function" && request.expectsJson()) {
            return response.status(status).json({
                status: "error",
                message: error.message || "Internal Server Error",
                error: error.name || "Error",
                stack: isDebug ? error.stack : undefined
            });
        }

        if (isDebug) {
            const stackHtml = error.stack ? `<pre style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 13px; font-family: monospace; line-height: 1.5;">${error.stack}</pre>` : '';
            const html = `
                <div style="font-family: system-ui, -apple-system, sans-serif; padding: 2rem; max-width: 850px; margin: 2rem auto; background: #fff0f0; border: 1px solid #ffcdd2; border-radius: 8px; color: #b71c1c;">
                    <h2 style="margin-top: 0;">${status} ${error.name || 'Error'}</h2>
                    <p style="font-size: 1.1rem;"><strong>Message:</strong> ${error.message || 'Internal Server Error'}</p>
                    ${stackHtml}
                </div>
            `;
            const res = response.status(status);
            if (typeof res.html === "function") {
                return res.html(html);
            }
            if (typeof res.send === "function") {
                return res.send(html);
            }
            return res;
        }

        const res = response.status(status);
        if (typeof res.text === "function") {
            return res.text("Internal Server Error");
        }
        if (typeof res.send === "function") {
            return res.send("Internal Server Error");
        }
        return res;
    }

    // ---- Validation ----

    validateExceptionManager(manager) {
        if (
            !manager ||
            typeof manager.resolveRenderer !== "function" ||
            typeof manager.resolveReporter !== "function"
        ) {
            throw new HttpExceptionHandlerError("HttpExceptionHandler requires an ExceptionManager with resolveRenderer() and resolveReporter() methods.");
        }
    }
}
