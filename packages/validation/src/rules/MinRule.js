import Rule from "../Rule.js";

export default class MinRule extends Rule {
    validate(value, field, data = {}, params = [], ruleSet = []) {
        if (value === undefined || value === null || value === "") return true;
        const minVal = Number(params[0] ?? 0);

        const isNumericType = typeof value === "number" || (Array.isArray(ruleSet) && ruleSet.some(r => ["number", "numeric", "integer"].includes(r.name)));

        if (isNumericType) {
            return Number(value) >= minVal;
        }
        if (typeof value === "string") {
            return value.length >= minVal;
        }
        if (Array.isArray(value)) {
            return value.length >= minVal;
        }
        return true;
    }

    message() {
        return "The :attribute field must be at least :min.";
    }
}
