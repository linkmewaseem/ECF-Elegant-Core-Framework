import HttpException from "./HttpException.js";

export default class ExceptionRenderer {
    constructor(debug = false) {
        this.debug = Boolean(debug);
        this.customRenderers = new Map();
    }

    /**
     * Register a custom renderer callback for a specific exception class.
     * @param {Function} exceptionClass 
     * @param {Function} rendererFn (error, request, response) => Response
     * @returns {this}
     */
    register(exceptionClass, rendererFn) {
        if (typeof exceptionClass === "function" && typeof rendererFn === "function") {
            this.customRenderers.set(exceptionClass, rendererFn);
        }
        return this;
    }

    /**
     * Render an exception into a Response instance.
     * @param {Error} error 
     * @param {Request} request 
     * @param {Response} response 
     * @returns {Promise<Response>|Response}
     */
    async render(error, request, response) {
        // Check custom renderers
        for (const [exceptionClass, customFn] of this.customRenderers) {
            if (error instanceof exceptionClass) {
                return customFn(error, request, response);
            }
        }

        const statusCode = (typeof error.statusCode === "number" && error.statusCode >= 100 && error.statusCode <= 599)
            ? error.statusCode
            : 500;

        response.status(statusCode);

        if (error.headers && typeof error.headers === "object") {
            for (const [key, val] of Object.entries(error.headers)) {
                response.header(key, val);
            }
        }

        const isJson = request && typeof request.expectsJson === "function" && request.expectsJson();

        if (isJson) {
            return this.renderJson(error, statusCode, response);
        }

        return await this.renderHtml(error, statusCode, request, response);
    }

    renderJson(error, statusCode, response) {
        if (this.debug) {
            return response.json({
                message: error.message || "Internal Server Error",
                statusCode,
                exception: error.name || "Error",
                errors: error.errors ?? undefined,
                stack: error.stack ? error.stack.split("\n").map(s => s.trim()) : []
            });
        }

        return response.json({
            message: statusCode >= 500 ? "Server Error" : (error.message || "An error occurred"),
            statusCode,
            errors: error.errors ?? undefined
        });
    }

    async renderHtml(error, statusCode, request, response) {
        // Try rendering view template errors/404, errors/500 if view engine present
        if (response.has && response.has("view")) {
            try {
                const viewName = `errors/${statusCode}`;
                return await response.view(viewName, {
                    error,
                    statusCode,
                    message: error.message
                });
            } catch (viewError) {
                // View rendering missing or failed, fall through to default HTML
            }
        }

        if (this.debug) {
            return response.html(this.generateDebugHtml(error, statusCode, request));
        }

        return response.html(this.generateProductionHtml(error, statusCode));
    }

    generateDebugHtml(error, statusCode, request) {
        const title = `${statusCode} | ${error.name || "Exception"}: ${error.message}`;
        const stack = error.stack ? this.escapeHtml(error.stack) : "No stack trace available.";
        const url = request?.url ?? "/";
        const method = request?.method ?? "GET";

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 2rem; }
        .container { max-width: 1000px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 2rem; border: 1px solid #334155; }
        .badge { background: #ef4444; color: white; padding: 4px 12px; border-radius: 6px; font-weight: bold; font-size: 0.9rem; }
        h1 { font-size: 1.5rem; margin-top: 1rem; color: #f43f5e; }
        .info { background: #0f172a; padding: 1rem; border-radius: 8px; font-family: monospace; margin: 1rem 0; }
        pre { background: #020617; color: #38bdf8; padding: 1.5rem; border-radius: 8px; overflow-x: auto; font-size: 0.9rem; line-height: 1.5; }
    </style>
</head>
<body>
    <div class="container">
        <span class="badge">HTTP ${statusCode}</span>
        <h1>${this.escapeHtml(error.name || "Error")}: ${this.escapeHtml(error.message)}</h1>
        <div class="info">
            <strong>Request:</strong> ${method} ${this.escapeHtml(url)}
        </div>
        <h2>Stack Trace</h2>
        <pre>${stack}</pre>
    </div>
</body>
</html>`;
    }

    generateProductionHtml(error, statusCode) {
        const statusTextMap = {
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Page Not Found",
            405: "Method Not Allowed",
            419: "Page Expired",
            422: "Unprocessable Entity",
            429: "Too Many Requests",
            500: "Server Error",
            503: "Service Unavailable"
        };
        const title = statusTextMap[statusCode] ?? "An Error Occurred";

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${statusCode} - ${title}</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #f8fafc; color: #334155; display: flex; height: 100vh; align-items: center; justify-content: center; margin: 0; }
        .box { text-align: center; border-left: 3px solid #64748b; padding-left: 1.5rem; }
        h1 { font-size: 2.5rem; margin: 0; font-weight: 300; }
    </style>
</head>
<body>
    <div class="box">
        <h1>${statusCode} | ${title}</h1>
    </div>
</body>
</html>`;
    }

    escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
}
