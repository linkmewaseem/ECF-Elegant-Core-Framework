import RuleRegistry from "./RuleRegistry.js";
import ValidationErrorBag from "./ValidationErrorBag.js";
import ValidationResult from "./ValidationResult.js";

export default class Validator {
    constructor(registry = new RuleRegistry()) {
        this.registry = registry;
    }

    /**
     * Extend validator with a custom rule.
     * @param {string} name 
     * @param {Function} callback 
     * @param {string} message 
     * @returns {this}
     */
    extend(name, callback, message = null) {
        this.registry.register(name, callback, message);
        return this;
    }

    /**
     * Validate data object against a set of field rules.
     * @param {Object} data 
     * @param {Object} rules 
     * @param {Object} customMessages 
     * @param {Object} customAttributes 
     * @returns {Promise<ValidationResult>}
     */
    async validate(data = {}, rules = {}, customMessages = {}, customAttributes = {}) {
        const errorBag = new ValidationErrorBag();
        const validatedFields = {};

        // Expand wildcard rules like "users.*.email" into concrete paths like "users.0.email"
        const expandedRules = this.expandRuleKeys(data, rules);

        for (const [fieldPath, ruleSpec] of Object.entries(expandedRules)) {
            const parsedRules = this.registry.parseRules(ruleSpec);
            const value = this.getValueByPath(data, fieldPath);

            // Handle "sometimes": skip validation if field is missing/undefined in input data
            const isSometimes = parsedRules.some(r => r.name === "sometimes");
            if (isSometimes && (value === undefined || !this.hasValueByPath(data, fieldPath))) {
                continue;
            }

            // Handle "exclude_if": skip adding to validatedFields if exclusion condition met
            const excludeRule = parsedRules.find(r => ["exclude_if", "excludeif"].includes(r.name));
            if (excludeRule && typeof excludeRule.instance?.shouldExclude === "function") {
                if (excludeRule.instance.shouldExclude(data, excludeRule.params)) {
                    continue;
                }
            }

            const isNullable = parsedRules.some(r => r.name === "nullable");
            if (isNullable && (value === null || value === undefined)) {
                this.setValueByPath(validatedFields, fieldPath, value);
                continue;
            }

            let fieldPassed = true;

            for (const { name, params, instance } of parsedRules) {
                if (name === "nullable" || name === "sometimes" || ["exclude_if", "excludeif"].includes(name)) continue;

                if (!instance) {
                    errorBag.add(fieldPath, `Unknown validation rule "${name}".`);
                    fieldPassed = false;
                    break;
                }

                const isValid = await instance.validate(value, fieldPath, data, params, parsedRules);
                if (!isValid) {
                    fieldPassed = false;
                    const message = this.formatErrorMessage(
                        name,
                        fieldPath,
                        params,
                        instance,
                        customMessages,
                        customAttributes
                    );
                    errorBag.add(fieldPath, message);
                }
            }

            if (fieldPassed && value !== undefined) {
                this.setValueByPath(validatedFields, fieldPath, value);
            }
        }

        return new ValidationResult(validatedFields, errorBag);
    }

    /**
     * Expand wildcard paths like "users.*.email" into concrete field paths.
     */
    expandRuleKeys(data, rules) {
        const expanded = {};

        for (const [key, ruleSpec] of Object.entries(rules)) {
            if (key.includes("*")) {
                const concretePaths = this.resolveWildcardPaths(data, key);
                for (const path of concretePaths) {
                    expanded[path] = ruleSpec;
                }
            } else {
                expanded[key] = ruleSpec;
            }
        }

        return expanded;
    }

    resolveWildcardPaths(data, pattern) {
        const segments = pattern.split(".");
        let currentPaths = [""];

        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            const nextPaths = [];

            for (const basePath of currentPaths) {
                const val = basePath ? this.getValueByPath(data, basePath) : data;

                if (seg === "*") {
                    if (Array.isArray(val)) {
                        for (let idx = 0; idx < val.length; idx++) {
                            nextPaths.push(basePath ? `${basePath}.${idx}` : `${idx}`);
                        }
                    } else if (val && typeof val === "object") {
                        for (const objKey of Object.keys(val)) {
                            nextPaths.push(basePath ? `${basePath}.${objKey}` : objKey);
                        }
                    }
                } else {
                    nextPaths.push(basePath ? `${basePath}.${seg}` : seg);
                }
            }

            currentPaths = nextPaths;
        }

        return currentPaths;
    }

    getValueByPath(obj, path) {
        if (!obj || typeof obj !== "object") return undefined;
        const parts = path.split(".");
        let current = obj;

        for (const part of parts) {
            if (current === null || current === undefined) return undefined;
            current = current[part];
        }

        return current;
    }

    hasValueByPath(obj, path) {
        if (!obj || typeof obj !== "object") return false;
        const parts = path.split(".");
        let current = obj;
        for (let i = 0; i < parts.length; i++) {
            if (current === null || current === undefined || !(parts[i] in current)) return false;
            current = current[parts[i]];
        }
        return true;
    }

    setValueByPath(obj, path, value) {
        const parts = path.split(".");
        let current = obj;

        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!current[part] || typeof current[part] !== "object") {
                const nextPartIsNum = !isNaN(Number(parts[i + 1]));
                current[part] = nextPartIsNum ? [] : {};
            }
            current = current[part];
        }

        current[parts[parts.length - 1]] = value;
    }

    formatErrorMessage(ruleName, fieldPath, params, ruleInstance, customMessages, customAttributes) {
        // Priority 1: Exact match "email.required" or "users.0.email.required"
        const specificKey = `${fieldPath}.${ruleName}`;
        if (customMessages[specificKey]) {
            return this.replaceTokens(customMessages[specificKey], fieldPath, params, customAttributes);
        }

        // Priority 2: Wildcard match "users.*.email.required"
        const wildcardKey = fieldPath.replace(/\.\d+\./g, ".*.") + `.${ruleName}`;
        if (customMessages[wildcardKey]) {
            return this.replaceTokens(customMessages[wildcardKey], fieldPath, params, customAttributes);
        }

        // Priority 3: Rule name match "required" or "email"
        if (customMessages[ruleName]) {
            return this.replaceTokens(customMessages[ruleName], fieldPath, params, customAttributes);
        }

        // Priority 4: Rule instance default message
        const template = ruleInstance.message ? ruleInstance.message() : "The :attribute field is invalid.";
        return this.replaceTokens(template, fieldPath, params, customAttributes);
    }

    replaceTokens(template, fieldPath, params, customAttributes) {
        const attrName = customAttributes[fieldPath] ?? this.humanizeField(fieldPath);

        let msg = template.replace(/:attribute/g, attrName);

        if (params.length > 0) {
            msg = msg.replace(/:min/g, params[0])
                     .replace(/:max/g, params[0])
                     .replace(/:size/g, params[0])
                     .replace(/:other/g, params[0]);
        }

        return msg;
    }

    humanizeField(fieldPath) {
        const lastPart = fieldPath.split(".").pop();
        return lastPart.replace(/_/g, " ");
    }
}
