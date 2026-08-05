import {ECFError} from "@ecfjs/core";

export default class RouterError extends ECFError {
    constructor(message) {
        super(message);
        this.name = "RouterError";
    }
}

