import ViewError from "../errors/ViewError.js";

export default class ComponentNode {
    constructor(componentName, attributes = [], defaultSlot = [], namedSlots = {}) {
        if (typeof componentName !== "string" || componentName.trim() === "") {
            throw new ViewError("ComponentNode requires a non-empty component name.");
        }

        this.type = "ComponentNode";
        this.componentName = componentName.trim();
        this.attributes = attributes; // Array of { name, isDynamic, isBoolean, value }
        this.defaultSlot = defaultSlot; // Array of AST nodes
        this.namedSlots = namedSlots; // Object: slotName -> Array of AST nodes
    }
}
