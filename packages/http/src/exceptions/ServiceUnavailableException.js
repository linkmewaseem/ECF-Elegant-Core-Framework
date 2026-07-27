import HttpException from "./HttpException.js";

export default class ServiceUnavailableException extends HttpException {
    constructor(message = "Service Unavailable", headers = {}, cause = null, context = {}) {
        super(503, message, headers, cause, context);
    }
}
