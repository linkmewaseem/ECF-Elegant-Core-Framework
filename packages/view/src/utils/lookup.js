/**
 * Safe dot-notation property resolver. No eval(), no Function().
 *
 * Examples:
 *   lookup({ user: { name: "Waseem" } }, "user.name")  → "Waseem"
 *   lookup({ count: 0 }, "count")                       → 0
 *   lookup({ user: null }, "user.name")                 → undefined
 */
export default function lookup(obj, path) {
    if (typeof path !== "string" || path.trim() === "") return undefined;
    if (obj === null || obj === undefined) return undefined;

    return path.trim().split(".").reduce((current, key) => {
        if (current === null || current === undefined) return undefined;
        return current[key];
    }, obj);
}
