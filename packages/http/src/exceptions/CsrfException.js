import HttpException from "./HttpException.js";

export default class CsrfException extends HttpException {
    constructor(message = "Page Expired", headers = {}, cause = null, context = {}) {
        super(419, message, headers, cause, context);
    }
}
