import Rule from "../Rule.js";

export default class EmailRule extends Rule {
    validate(value) {
        if (value === undefined || value === null || value === "") return true;
        if (typeof value !== "string") return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }

    message() {
        return "The :attribute field must be a valid email address.";
    }
}
