import HttpException from "./HttpException.js";

export default class ValidationException extends HttpException {
    constructor(errors = {}, message = "The given data was invalid.", headers = {}, cause = null, context = {}) {
        super(422, message, headers, cause, context);
        this.errors = errors;
    }

    static withErrors(errors, message = "The given data was invalid.") {
        return new ValidationException(errors, message);
    }
}
