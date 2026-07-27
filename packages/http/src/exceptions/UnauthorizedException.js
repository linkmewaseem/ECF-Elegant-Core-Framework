import HttpException from "./HttpException.js";

export default class UnauthorizedException extends HttpException {
    constructor(message = "Unauthorized", headers = {}, cause = null, context = {}) {
        super(401, message, headers, cause, context);
    }
}
