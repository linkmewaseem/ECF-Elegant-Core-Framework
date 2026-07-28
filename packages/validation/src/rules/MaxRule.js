import Rule from "../Rule.js";

export default class MaxRule extends Rule {
    validate(value, field, data = {}, params = [], ruleSet = []) {
        if (value === undefined || value === null || value === "") return true;
        const maxVal = Number(params[0] ?? 0);

        const isNumericType = typeof value === "number" || (Array.isArray(ruleSet) && ruleSet.some(r => ["number", "numeric", "integer"].includes(r.name)));

        if (isNumericType) {
            return Number(value) <= maxVal;
        }
        if (typeof value === "string") {
            return value.length <= maxVal;
        }
        if (Array.isArray(value)) {
            return value.length <= maxVal;
        }
        return true;
    }

    message() {
        return "The :attribute field must not exceed :max.";
    }
}
