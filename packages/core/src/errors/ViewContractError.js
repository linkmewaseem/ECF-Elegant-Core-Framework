import ECFError from "./ECFError.js";

/**
 * Error thrown when there is a ViewContract issue.
 */
export default class ViewContractError extends ECFError {
    constructor(message) {
        super(message);
        this.name = "ViewContractError";
    }
}
