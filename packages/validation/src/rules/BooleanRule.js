import Rule from "../Rule.js";

export default class BooleanRule extends Rule {
    validate(value) {
        if (value === undefined || value === null || value === "") return true;
        const valid = [true, false, 1, 0, "1", "0", "true", "false", "on", "off"];
        return valid.includes(value);
    }

    message() {
        return "The :attribute field must be true or false.";
    }
}
