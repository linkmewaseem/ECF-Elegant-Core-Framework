import Rule from "../Rule.js";

export default class NumberRule extends Rule {
    validate(value) {
        if (value === undefined || value === null || value === "") return true;
        return typeof value === "number" || (!isNaN(value) && !isNaN(parseFloat(value)));
    }

    message() {
        return "The :attribute field must be a number.";
    }
}
