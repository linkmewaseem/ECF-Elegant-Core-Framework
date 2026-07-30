import Cast from "./Cast.js";

export default class JsonCast extends Cast {
    get(value) {
        if (value === null || value === undefined) return null;
        if (typeof value === "string") {
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        }
        return value;
    }

    set(value) {
        if (value === null || value === undefined) return null;
        if (typeof value === "object") {
            return JSON.stringify(value);
        }
        return value;
    }
}
