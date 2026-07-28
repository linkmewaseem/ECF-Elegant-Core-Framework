import Rule from "../Rule.js";

export default class InRule extends Rule {
    validate(value, field, data, params = []) {
        if (value === undefined || value === null || value === "") return true;
        const allowed = params.map(p => String(p).trim());
        return allowed.includes(String(value).trim());
    }

    message() {
        return "The selected :attribute is invalid.";
    }
}
