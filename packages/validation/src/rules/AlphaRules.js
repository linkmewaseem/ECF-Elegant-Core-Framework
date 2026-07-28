import Rule from "../Rule.js";

export class AlphaRule extends Rule {
    validate(value) {
        if (value === undefined || value === null || value === "") return true;
        if (typeof value !== "string") return false;
        return /^[a-zA-Z]+$/.test(value);
    }

    message() {
        return "The :attribute field must only contain letters.";
    }
}

export class AlphaNumRule extends Rule {
    validate(value) {
        if (value === undefined || value === null || value === "") return true;
        if (typeof value !== "string" && typeof value !== "number") return false;
        return /^[a-zA-Z0-9]+$/.test(String(value));
    }

    message() {
        return "The :attribute field must only contain letters and numbers.";
    }
}

export class AlphaDashRule extends Rule {
    validate(value) {
        if (value === undefined || value === null || value === "") return true;
        if (typeof value !== "string" && typeof value !== "number") return false;
        return /^[a-zA-Z0-9_-]+$/.test(String(value));
    }

    message() {
        return "The :attribute field may only contain letters, numbers, dashes and underscores.";
    }
}
