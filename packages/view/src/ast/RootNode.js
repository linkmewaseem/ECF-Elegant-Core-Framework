import ViewError from "../errors/ViewError.js";

export default class RootNode {
    constructor(children) {
        if (!Array.isArray(children)) {
            throw new ViewError("RootNode requires an array of children.");
        }

        this.type = "Root";
        this.children = [...children];
    }
}
