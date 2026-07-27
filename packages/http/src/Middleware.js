import MiddlewareError from "./errors/MiddlewareError.js";

export default class Middleware {
    /**
     * Handle an incoming request.
     * @param {Request} request 
     * @param {Response} response 
     * @param {Function} next 
     * @returns {any}
     */
    handle(request, response, next) {
        throw new MiddlewareError("Middleware.handle() must be implemented.");
    }

    /**
     * Optional lifecycle hook executed AFTER response has been sent to the client.
     * @param {Request} request 
     * @param {Response} response 
     */
    terminate(request, response) {
        // Optional override in subclasses
    }
}