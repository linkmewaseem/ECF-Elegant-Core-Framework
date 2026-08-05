import {ECFError} from '@ecfjs/core';

/**
 * Error thrown when a route-related error occurs.
 */
export default class MiddlewareError extends ECFError {
    constructor(message) {
        super(message);
         this.name = "MiddlewareError";
    }
}