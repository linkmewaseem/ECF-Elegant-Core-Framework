import ExceptionReporter from "./ExceptionReporter.js";
import ExceptionRenderer from "./ExceptionRenderer.js";

export default class ExceptionHandler {
    constructor(options = {}) {
        this.debug = Boolean(options.debug ?? false);
        this.reporter = options.reporter ?? new ExceptionReporter();
        this.renderer = options.renderer ?? new ExceptionRenderer(this.debug);
    }

    /**
     * Report the exception to registered loggers/reporters.
     * @param {Error} error 
     */
    report(error) {
        if (this.reporter && typeof this.reporter.report === "function") {
            this.reporter.report(error);
        }
    }

    /**
     * Render the exception into an HTTP Response.
     * @param {Error} error 
     * @param {Request} request 
     * @param {Response} response 
     * @returns {Promise<Response>|Response}
     */
    render(error, request, response) {
        if (this.renderer && typeof this.renderer.render === "function") {
            return this.renderer.render(error, request, response);
        }
        return response.status(500).text("Internal Server Error");
    }

    /**
     * Main entry point called by HttpKernel on caught errors.
     * @param {Error} error 
     * @param {Request} request 
     * @param {Response} response 
     * @returns {Promise<Response>|Response}
     */
    handle(error, request, response) {
        this.report(error);
        return this.render(error, request, response);
    }

    /**
     * Add an exception class to the dontReport list.
     * @param {Function} exceptionClass 
     * @returns {this}
     */
    dontReport(exceptionClass) {
        if (this.reporter && typeof this.reporter.dontReport === "function") {
            this.reporter.dontReport(exceptionClass);
        }
        return this;
    }

    /**
     * Register a custom reporter plugin callback or class.
     * @param {Function|Object} reporter 
     * @returns {this}
     */
    registerReporter(reporter) {
        if (this.reporter && typeof this.reporter.register === "function") {
            this.reporter.register(reporter);
        }
        return this;
    }

    /**
     * Register a custom exception renderer function.
     * @param {Function} exceptionClass 
     * @param {Function} rendererFn 
     * @returns {this}
     */
    registerRenderer(exceptionClass, rendererFn) {
        if (this.renderer && typeof this.renderer.register === "function") {
            this.renderer.register(exceptionClass, rendererFn);
        }
        return this;
    }
}
