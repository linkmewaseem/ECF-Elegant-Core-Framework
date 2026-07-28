import Rule from "../Rule.js";

export default class IntegerRule extends Rule {
    validate(value) {
        if (value === undefined || value === null || value === "") return true;
        const num = Number(value);
        return Number.isInteger(num);
    }

    message() {
        return "The :attribute field must be an integer.";
    }
}
