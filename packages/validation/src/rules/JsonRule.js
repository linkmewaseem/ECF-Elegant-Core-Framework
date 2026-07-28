import Rule from "../Rule.js";

export default class JsonRule extends Rule {
    validate(value) {
        if (value === undefined || value === null || value === "") return true;
        if (typeof value !== "string") return false;
        try {
            JSON.parse(value);
            return true;
        } catch {
            return false;
        }
    }

    message() {
        return "The :attribute field must be a valid JSON string.";
    }
}
