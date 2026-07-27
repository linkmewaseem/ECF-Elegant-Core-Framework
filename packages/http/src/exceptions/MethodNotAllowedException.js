import HttpException from "./HttpException.js";

export default class MethodNotAllowedException extends HttpException {
    constructor(message = "Method Not Allowed", allowedMethods = [], headers = {}, cause = null, context = {}) {
        const allowHeader = Array.isArray(allowedMethods) && allowedMethods.length > 0
            ? { Allow: allowedMethods.join(", ").toUpperCase(), ...headers }
            : headers;

        super(405, message, allowHeader, cause, context);
        this.allowedMethods = Array.isArray(allowedMethods) ? allowedMethods.map(m => m.toUpperCase()) : [];
    }
}
