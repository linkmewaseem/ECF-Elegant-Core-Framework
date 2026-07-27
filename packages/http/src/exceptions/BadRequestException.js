import HttpException from "./HttpException.js";

export default class BadRequestException extends HttpException {
    constructor(message = "Bad Request", headers = {}, cause = null, context = {}) {
        super(400, message, headers, cause, context);
    }
}
