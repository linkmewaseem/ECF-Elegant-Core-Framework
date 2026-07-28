import Rule from "../Rule.js";

export class BetweenRule extends Rule {
    validate(value, field, data = {}, params = [], ruleSet = []) {
        if (value === undefined || value === null || value === "") return true;
        const min = Number(params[0] ?? 0);
        const max = Number(params[1] ?? Infinity);

        const isNumericType = typeof value === "number" || (Array.isArray(ruleSet) && ruleSet.some(r => ["number", "numeric", "integer"].includes(r.name)));

        if (isNumericType) {
            const num = Number(value);
            return num >= min && num <= max;
        }
        if (typeof value === "string" || Array.isArray(value)) {
            return value.length >= min && value.length <= max;
        }
        return false;
    }

    message() {
        return "The :attribute field must be between :min and :max.";
    }
}

export class SameRule extends Rule {
    validate(value, field, data = {}, params = []) {
        if (value === undefined || value === null || value === "") return true;
        const otherField = params[0];
        if (!otherField) return false;

        const otherValue = this.getValueByPath(data, otherField);
        return value === otherValue;
    }

    getValueByPath(obj, path) {
        if (!obj || !path) return undefined;
        return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
    }

    message() {
        return "The :attribute field and :other must match.";
    }
}

export class DifferentRule extends Rule {
    validate(value, field, data = {}, params = []) {
        if (value === undefined || value === null || value === "") return true;
        const otherField = params[0];
        if (!otherField) return true;

        const otherValue = this.getValueByPath(data, otherField);
        return value !== otherValue;
    }

    getValueByPath(obj, path) {
        if (!obj || !path) return undefined;
        return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
    }

    message() {
        return "The :attribute field and :other must be different.";
    }
}

export class DigitsRule extends Rule {
    validate(value, field, data = {}, params = []) {
        if (value === undefined || value === null || value === "") return true;
        const len = Number(params[0] ?? 0);
        const str = String(value);
        return /^\d+$/.test(str) && str.length === len;
    }

    message() {
        return "The :attribute field must be :digits digits.";
    }
}

export class DigitsBetweenRule extends Rule {
    validate(value, field, data = {}, params = []) {
        if (value === undefined || value === null || value === "") return true;
        const min = Number(params[0] ?? 0);
        const max = Number(params[1] ?? Infinity);
        const str = String(value);
        return /^\d+$/.test(str) && str.length >= min && str.length <= max;
    }

    message() {
        return "The :attribute field must be between :min and :max digits.";
    }
}

export class StartsWithRule extends Rule {
    validate(value, field, data = {}, params = []) {
        if (value === undefined || value === null || value === "") return true;
        if (typeof value !== "string") return false;
        return params.some(prefix => value.startsWith(prefix));
    }

    message() {
        return "The :attribute field must start with one of the following values.";
    }
}

export class EndsWithRule extends Rule {
    validate(value, field, data = {}, params = []) {
        if (value === undefined || value === null || value === "") return true;
        if (typeof value !== "string") return false;
        return params.some(suffix => value.endsWith(suffix));
    }

    message() {
        return "The :attribute field must end with one of the following values.";
    }
}

export class ContainsRule extends Rule {
    validate(value, field, data = {}, params = []) {
        if (value === undefined || value === null || value === "") return true;
        if (typeof value !== "string" && !Array.isArray(value)) return false;
        return params.every(sub => value.includes(sub));
    }

    message() {
        return "The :attribute field does not contain the required value.";
    }
}
