import Rule from "../Rule.js";

export default class UrlRule extends Rule {
    validate(value) {
        if (value === undefined || value === null || value === "") return true;
        if (typeof value !== "string") return false;
        try {
            const url = new URL(value);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    }

    message() {
        return "The :attribute field must be a valid URL.";
    }
}
