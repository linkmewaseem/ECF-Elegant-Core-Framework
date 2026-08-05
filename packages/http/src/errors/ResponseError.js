import {ECFError} from "@ecfjs/core";
export default class ResponseError extends ECFError {
    constructor(message) {
        super(message);
        this.name = "ResponseError";
    }
}