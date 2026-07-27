import HttpException from "./HttpException.js";

export default class InternalServerException extends HttpException {
    constructor(message = "Internal Server Error", headers = {}, cause = null, context = {}) {
        super(500, message, headers, cause, context);
    }
}
