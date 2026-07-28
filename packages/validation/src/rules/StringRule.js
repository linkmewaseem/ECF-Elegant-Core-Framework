import Rule from "../Rule.js";

export default class StringRule extends Rule {
    validate(value) {
        if (value === undefined || value === null) return true;
        return typeof value === "string";
    }

    message() {
        return "The :attribute field must be a string.";
    }
}
