import Rule from "../Rule.js";

function getValueByPath(obj, path) {
    if (!obj || !path) return undefined;
    return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

export class RequiredIf extends Rule {
    validate(value, field, data = {}, params = []) {
        const targetField = params[0];
        const targetValues = params.slice(1);
        if (!targetField) return true;

        const actualVal = getValueByPath(data, targetField);

        const isConditionMet = targetValues.length === 0
            ? (actualVal !== undefined && actualVal !== null && actualVal !== "")
            : targetValues.includes(String(actualVal));

        if (!isConditionMet) {
            return true;
        }

        // Required logic
        if (value === undefined || value === null) return false;
        if (typeof value === "string" && value.trim() === "") return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
    }

    message() {
        return "The :attribute field is required.";
    }
}

export class RequiredUnless extends Rule {
    validate(value, field, data = {}, params = []) {
        const targetField = params[0];
        const targetValues = params.slice(1);
        if (!targetField) return true;

        const actualVal = getValueByPath(data, targetField);

        const isConditionMet = targetValues.includes(String(actualVal));

        if (isConditionMet) {
            return true;
        }

        // Required logic
        if (value === undefined || value === null) return false;
        if (typeof value === "string" && value.trim() === "") return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
    }

    message() {
        return "The :attribute field is required.";
    }
}

export class Sometimes extends Rule {
    validate(value, field, data = {}) {
        return true; // Execution logic handled in Validator.js loop
    }

    message() {
        return "";
    }
}

export class ExcludeIf extends Rule {
    validate(value, field, data = {}, params = []) {
        return true; // Logic handled in Validator.js to strip field if condition met
    }

    shouldExclude(data, params = []) {
        const targetField = params[0];
        const targetValues = params.slice(1);
        if (!targetField) return false;

        const actualVal = getValueByPath(data, targetField);
        return targetValues.length === 0
            ? (actualVal !== undefined && actualVal !== null && actualVal !== "")
            : targetValues.includes(String(actualVal));
    }

    message() {
        return "";
    }
}
