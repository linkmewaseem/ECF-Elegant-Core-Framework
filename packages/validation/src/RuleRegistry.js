import Required from "./rules/Required.js";
import Nullable from "./rules/Nullable.js";
import StringRule from "./rules/StringRule.js";
import NumberRule from "./rules/NumberRule.js";
import IntegerRule from "./rules/IntegerRule.js";
import BooleanRule from "./rules/BooleanRule.js";
import ArrayRule from "./rules/ArrayRule.js";
import EmailRule from "./rules/EmailRule.js";
import MinRule from "./rules/MinRule.js";
import MaxRule from "./rules/MaxRule.js";
import InRule from "./rules/InRule.js";
import ConfirmedRule from "./rules/ConfirmedRule.js";
import AcceptedRule from "./rules/AcceptedRule.js";

import DateRule from "./rules/DateRule.js";
import UrlRule from "./rules/UrlRule.js";
import UuidRule from "./rules/UuidRule.js";
import RegexRule from "./rules/RegexRule.js";
import JsonRule from "./rules/JsonRule.js";
import IpRule from "./rules/IpRule.js";
import { AlphaRule, AlphaNumRule, AlphaDashRule } from "./rules/AlphaRules.js";
import {
    BetweenRule,
    SameRule,
    DifferentRule,
    DigitsRule,
    DigitsBetweenRule,
    StartsWithRule,
    EndsWithRule,
    ContainsRule
} from "./rules/ComparisonRules.js";
import { RequiredIf, RequiredUnless, Sometimes, ExcludeIf } from "./rules/ConditionalRules.js";

export default class RuleRegistry {
    constructor() {
        this.rules = new Map();
        this.registerDefaults();
    }

    registerDefaults() {
        this.register("required", new Required());
        this.register("nullable", new Nullable());
        this.register("string", new StringRule());
        this.register("number", new NumberRule());
        this.register("numeric", new NumberRule());
        this.register("integer", new IntegerRule());
        this.register("boolean", new BooleanRule());
        this.register("array", new ArrayRule());
        this.register("email", new EmailRule());
        this.register("min", new MinRule());
        this.register("max", new MaxRule());
        this.register("in", new InRule());
        this.register("confirmed", new ConfirmedRule());
        this.register("accepted", new AcceptedRule());

        // Extended Phase 2 Rules
        this.register("date", new DateRule());
        this.register("url", new UrlRule());
        this.register("uuid", new UuidRule());
        this.register("regex", new RegexRule());
        this.register("json", new JsonRule());
        this.register("ip", new IpRule());
        this.register("ipv4", new IpRule("v4"));
        this.register("ipv6", new IpRule("v6"));

        this.register("alpha", new AlphaRule());
        this.register("alphanum", new AlphaNumRule());
        this.register("alpha_num", new AlphaNumRule());
        this.register("alphadash", new AlphaDashRule());
        this.register("alpha_dash", new AlphaDashRule());

        this.register("between", new BetweenRule());
        this.register("same", new SameRule());
        this.register("different", new DifferentRule());
        this.register("digits", new DigitsRule());
        this.register("digitsbetween", new DigitsBetweenRule());
        this.register("digits_between", new DigitsBetweenRule());
        this.register("startswith", new StartsWithRule());
        this.register("starts_with", new StartsWithRule());
        this.register("endswith", new EndsWithRule());
        this.register("ends_with", new EndsWithRule());
        this.register("contains", new ContainsRule());

        // Conditional Phase 3 Rules
        this.register("required_if", new RequiredIf());
        this.register("requiredif", new RequiredIf());
        this.register("required_unless", new RequiredUnless());
        this.register("requiredunless", new RequiredUnless());
        this.register("sometimes", new Sometimes());
        this.register("exclude_if", new ExcludeIf());
        this.register("excludeif", new ExcludeIf());
    }

    /**
     * Register a rule instance or callback function.
     * @param {string} name 
     * @param {Rule|Function} rule 
     * @param {string} defaultMessage 
     */
    register(name, rule, defaultMessage = null) {
        if (typeof name !== "string" || !name.trim()) return this;
        const normalized = name.trim().toLowerCase();

        if (typeof rule === "function" && !(rule.prototype && rule.prototype.validate)) {
            // Callback closure custom rule
            this.rules.set(normalized, {
                validate: (val, field, data, params) => rule(val, field, data, params),
                message: () => defaultMessage ?? "The :attribute field is invalid."
            });
        } else if (typeof rule === "object" && typeof rule.validate === "function") {
            this.rules.set(normalized, rule);
        } else if (typeof rule === "function") {
            this.rules.set(normalized, new rule());
        }
        return this;
    }

    /**
     * Resolve a rule name to a rule object.
     * @param {string} name 
     * @returns {Object|null}
     */
    resolve(name) {
        if (typeof name !== "string") return null;
        return this.rules.get(name.trim().toLowerCase()) ?? null;
    }

    /**
     * Parse string rules like "required|email|min:8|in:a,b,c" or array rules.
     * @param {string|Array} rulesInput 
     * @returns {Array<{name: string, params: Array, instance: Object}>}
     */
    parseRules(rulesInput) {
        if (!rulesInput) return [];

        const ruleDefinitions = [];

        if (typeof rulesInput === "string") {
            const parts = rulesInput.split("|").map(s => s.trim()).filter(Boolean);
            for (const part of parts) {
                const colonIdx = part.indexOf(":");
                let name = part;
                let params = [];

                if (colonIdx !== -1) {
                    name = part.slice(0, colonIdx).trim();
                    const rawParams = part.slice(colonIdx + 1);
                    params = rawParams.split(",").map(p => p.trim());
                }

                const instance = this.resolve(name);
                ruleDefinitions.push({ name, params, instance });
            }
        } else if (Array.isArray(rulesInput)) {
            for (const r of rulesInput) {
                if (typeof r === "string") {
                    ruleDefinitions.push(...this.parseRules(r));
                } else if (r && typeof r.validate === "function") {
                    ruleDefinitions.push({
                        name: r.name ?? "custom",
                        params: [],
                        instance: r
                    });
                }
            }
        }

        return ruleDefinitions;
    }
}
