import Cast from "./Cast.js";

export default class FloatCast extends Cast {
    get(value) {
        if (value === null || value === undefined) return null;
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? null : parsed;
    }

    set(value) {
        if (value === null || value === undefined) return null;
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? null : parsed;
    }
}
