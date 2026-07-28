import Rule from "../Rule.js";

export default class DateRule extends Rule {
    validate(value) {
        if (value === undefined || value === null || value === "") return true;
        if (value instanceof Date) return !isNaN(value.getTime());
        if (typeof value === "number") return !isNaN(new Date(value).getTime());
        if (typeof value === "string") {
            const timestamp = Date.parse(value);
            return !isNaN(timestamp);
        }
        return false;
    }

    message() {
        return "The :attribute field must be a valid date.";
    }
}
