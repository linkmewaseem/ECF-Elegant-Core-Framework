import { ECFError } from "@ecf/core";

export default class ViewError extends ECFError {
    constructor(message) {
        super(message);
        this.name = "ViewError";
    }
}
