import HttpException from "./HttpException.js";

export default class NotFoundException extends HttpException {
    constructor(message = "Not Found", headers = {}, cause = null, context = {}) {
        super(404, message, headers, cause, context);
    }
}
