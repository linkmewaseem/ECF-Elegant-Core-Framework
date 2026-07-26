import ViewError from "../../errors/ViewError.js";

export default class ExpressionError extends ViewError {
    constructor(message, position = null) {
        const fullMessage = position !== null ? `${message} at position ${position}` : message;
        super(fullMessage);
        this.name = "ExpressionError";
        this.position = position;
    }
}
