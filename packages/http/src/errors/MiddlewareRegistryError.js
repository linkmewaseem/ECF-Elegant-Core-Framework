import { ECFError } from '@ecfjs/core';

/**
 * Error thrown when a middleware registry-related error occurs.
 */
export default class MiddlewareRegistryError extends ECFError {
    constructor(message) {
        super(message);
        this.name = "MiddlewareRegistryError";
    }
}
