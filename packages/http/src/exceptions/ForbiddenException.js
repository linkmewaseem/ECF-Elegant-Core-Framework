import HttpException from "./HttpException.js";

export default class ForbiddenException extends HttpException {
    constructor(message = "Forbidden", headers = {}, cause = null, context = {}) {
        super(403, message, headers, cause, context);
    }
}
