import Rule from "../Rule.js";

export default class UuidRule extends Rule {
    #uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

    validate(value) {
        if (value === undefined || value === null || value === "") return true;
        if (typeof value !== "string") return false;
        return this.#uuidRegex.test(value);
    }

    message() {
        return "The :attribute field must be a valid UUID.";
    }
}
