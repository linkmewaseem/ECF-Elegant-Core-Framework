import HttpException from "./HttpException.js";

export default class RateLimitException extends HttpException {
    constructor(message = "Too Many Requests", retryAfterSeconds = null, headers = {}, cause = null, context = {}) {
        const customHeaders = { ...headers };
        if (retryAfterSeconds !== null && retryAfterSeconds !== undefined) {
            customHeaders["Retry-After"] = String(retryAfterSeconds);
        }

        super(429, message, customHeaders, cause, context);
        this.retryAfter = retryAfterSeconds;
    }
}
