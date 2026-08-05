import {ECFError} from '@ecfjs/core';

/**
 * Error thrown when a request fails.
 */
export default class RequestError extends ECFError {
    constructor(message) {
        super(message);
         this.name = "RequestError";
    }
}