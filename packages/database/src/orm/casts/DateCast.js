import Cast from "./Cast.js";

export default class DateCast extends Cast {
    get(value) {
        if (value === null || value === undefined) return null;
        if (value instanceof Date) return value;
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    set(value) {
        if (value === null || value === undefined) return null;
        if (value instanceof Date) {
            return value.toISOString();
        }
        return value;
    }
}
