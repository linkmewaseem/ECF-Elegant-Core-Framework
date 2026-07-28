import Rule from "../Rule.js";

export default class ArrayRule extends Rule {
    validate(value) {
        if (value === undefined || value === null) return true;
        return Array.isArray(value);
    }

    message() {
        return "The :attribute field must be an array.";
    }
}
