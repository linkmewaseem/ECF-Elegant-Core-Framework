import {ECFError} from '@ecfjs/core';

/**
 * Error thrown when a route-related error occurs.
 */
export default class RouteError extends ECFError {
    constructor(message) {
        super(message);
         this.name = "RouteError";
    }
}