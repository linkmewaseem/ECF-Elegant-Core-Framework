import { ECFError } from '@ecfjs/core';

/**
 * Error thrown when a middleware resolver-related error occurs.
 */
export default class MiddlewareResolverError extends ECFError {
    constructor(message) {
        super(message);
        this.name = "MiddlewareResolverError";
    }
}
