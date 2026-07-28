import Rule from "../Rule.js";

export default class RegexRule extends Rule {
    validate(value, field, data = {}, params = []) {
        if (value === undefined || value === null || value === "") return true;
        const pattern = params.join(",");
        if (!pattern) return false;

        try {
            const regex = new RegExp(pattern);
            return regex.test(String(value));
        } catch {
            return false;
        }
    }

    message() {
        return "The :attribute field format is invalid.";
    }
}
