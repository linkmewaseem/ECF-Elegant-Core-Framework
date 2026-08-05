import { ECFError } from '@ecfjs/core';

/**
 * Error thrown when a pipeline-related error occurs.
 */
export default class HttpServerError extends ECFError {
    constructor(message) {
        super(message);
        this.name = "HttpServerError";
    }
}
