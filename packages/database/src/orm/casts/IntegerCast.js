import Cast from "./Cast.js";

export default class IntegerCast extends Cast {
    get(value) {
        if (value === null || value === undefined) return null;
        const parsed = parseInt(value, 10);
        return Number.isNaN(parsed) ? null : parsed;
    }

    set(value) {
        if (value === null || value === undefined) return null;
        const parsed = parseInt(value, 10);
        return Number.isNaN(parsed) ? null : parsed;
    }
}
