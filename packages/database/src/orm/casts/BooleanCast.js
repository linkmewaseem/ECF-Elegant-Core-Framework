import Cast from "./Cast.js";

export default class BooleanCast extends Cast {
    get(value) {
        if (value === null || value === undefined) return null;
        if (typeof value === "boolean") return value;
        if (typeof value === "string") {
            const lower = value.trim().toLowerCase();
            if (lower === "true" || lower === "1") return true;
            if (lower === "false" || lower === "0") return false;
        }
        return Boolean(value);
    }

    set(value) {
        if (value === null || value === undefined) return null;
        if (typeof value === "boolean") return value;
        if (typeof value === "string") {
            const lower = value.trim().toLowerCase();
            if (lower === "true" || lower === "1") return true;
            if (lower === "false" || lower === "0") return false;
        }
        return Boolean(value);
    }
}
