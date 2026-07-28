export default class Rule {
    /**
     * Validate the given field value.
     * @param {any} value 
     * @param {string} field 
     * @param {Object} data 
     * @param {Array} params 
     * @returns {boolean|Promise<boolean>}
     */
    validate(value, field, data = {}, params = []) {
        return true;
    }

    /**
     * Return default error message template.
     * @returns {string}
     */
    message() {
        return "The :attribute field is invalid.";
    }

    // Static Rule Factory Helpers

    static required() { return "required"; }
    static nullable() { return "nullable"; }
    static string() { return "string"; }
    static number() { return "number"; }
    static integer() { return "integer"; }
    static boolean() { return "boolean"; }
    static array() { return "array"; }
    static email() { return "email"; }
    static date() { return "date"; }
    static url() { return "url"; }
    static uuid() { return "uuid"; }
    static json() { return "json"; }
    static alpha() { return "alpha"; }
    static alphaNum() { return "alphanum"; }
    static alphaDash() { return "alphadash"; }
    static sometimes() { return "sometimes"; }

    static min(value) { return `min:${value}`; }
    static max(value) { return `max:${value}`; }
    static in(...allowed) {
        const flat = allowed.flat();
        return `in:${flat.join(",")}`;
    }
    static regex(pattern) { return `regex:${pattern}`; }
    static ip(version = "any") { return `ip:${version}`; }
    static between(min, max) { return `between:${min},${max}`; }
    static same(field) { return `same:${field}`; }
    static different(field) { return `different:${field}`; }
    static digits(len) { return `digits:${len}`; }
    static digitsBetween(min, max) { return `digitsbetween:${min},${max}`; }
    static startsWith(...values) { return `startswith:${values.flat().join(",")}`; }
    static endsWith(...values) { return `endswith:${values.flat().join(",")}`; }
    static contains(...values) { return `contains:${values.flat().join(",")}`; }

    static requiredIf(field, ...values) {
        const valStr = values.flat().join(",");
        return valStr ? `required_if:${field},${valStr}` : `required_if:${field}`;
    }

    static requiredUnless(field, ...values) {
        const valStr = values.flat().join(",");
        return `required_unless:${field},${valStr}`;
    }

    static excludeIf(field, ...values) {
        const valStr = values.flat().join(",");
        return `exclude_if:${field},${valStr}`;
    }
}
