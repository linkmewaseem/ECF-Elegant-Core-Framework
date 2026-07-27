/**
 * Safely accesses a nested property using dot-notation path or array of keys.
 * 
 * @param {Object} obj Target object
 * @param {string|Array<string>} path Property path e.g. "user.profile.email" or ["user", "profile", "email"]
 * @param {any} [defaultValue=null] Fallback value if missing or nullish
 * @returns {any} Resolved property value or defaultValue
 */
export default function lookup(obj, path, defaultValue = null) {
    if (obj === null || obj === undefined) {
        return defaultValue;
    }

    if (path === null || path === undefined || path === "") {
        return defaultValue;
    }

    const keys = Array.isArray(path)
        ? path
        : String(path).split(".").filter(Boolean);

    let current = obj;

    for (const key of keys) {
        if (current === null || current === undefined || typeof current !== "object") {
            return defaultValue;
        }

        if (!(key in current)) {
            return defaultValue;
        }

        current = current[key];
    }

    return current !== undefined && current !== null ? current : defaultValue;
}
