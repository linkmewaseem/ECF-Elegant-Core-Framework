import ViewError from "../errors/ViewError.js";

export default class TextNode {
    constructor(value) {
        if (typeof value !== "string") {
            throw new ViewError("TextNode requires a string value.");
        }

        this.type = "TextNode";
        this.value = value;
    }
}
