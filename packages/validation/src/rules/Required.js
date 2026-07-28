import Rule from "../Rule.js";

export default class Required extends Rule {
    validate(value) {
        if (value === undefined || value === null) return false;
        if (typeof value === "string") return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
    }

    message() {
        return "The :attribute field is required.";
    }
}
