export default class HttpException extends Error {
    constructor(statusCode = 500, message = "Internal Server Error", headers = {}, cause = null, context = {}) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.headers = { ...headers };
        this.cause = cause;
        this.context = { ...context };

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
