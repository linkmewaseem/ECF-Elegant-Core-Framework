export class Rule {
    validate(value: any, field?: string, data?: any, params?: any[]): boolean | Promise<boolean>;
    message(): string;

    static required(): string;
    static nullable(): string;
    static string(): string;
    static number(): string;
    static integer(): string;
    static boolean(): string;
    static array(): string;
    static email(): string;
    static date(): string;
    static url(): string;
    static uuid(): string;
    static json(): string;
    static alpha(): string;
    static alphaNum(): string;
    static alphaDash(): string;
    static sometimes(): string;

    static min(value: number): string;
    static max(value: number): string;
    static in(...allowed: any[]): string;
    static regex(pattern: string | RegExp): string;
    static ip(version?: string): string;
    static between(min: number, max: number): string;
    static same(field: string): string;
    static different(field: string): string;
    static digits(len: number): string;
    static digitsBetween(min: number, max: number): string;
    static startsWith(...values: string[]): string;
    static endsWith(...values: string[]): string;
    static contains(...values: string[]): string;
    static requiredIf(field: string, ...values: any[]): string;
    static requiredUnless(field: string, ...values: any[]): string;
    static excludeIf(field: string, ...values: any[]): string;
}

export class ValidationErrorBag {
    add(field: string, message: string): void;
    get(field: string): string[];
    first(field: string): string | null;
    has(field: string): boolean;
    all(): Record<string, string[]>;
    flat(): string[];
    isEmpty(): boolean;
    count(): number;
}

export class ValidationResult {
    constructor(validatedData?: Record<string, any>, errorBag?: ValidationErrorBag);
    isValid(): boolean;
    fails(): boolean;
    errors(): ValidationErrorBag;
    validated(): Record<string, any>;
    throwIfFailed(exceptionClass?: any): Record<string, any>;
}

export class RuleRegistry {
    register(name: string, rule: any, defaultMessage?: string): this;
    resolve(name: string): any;
    parseRules(rulesInput: any): any[];
}

export class Validator {
    constructor(registry?: RuleRegistry);
    extend(name: string, callback: Function, message?: string): this;
    validate(data?: Record<string, any>, rules?: Record<string, any>, customMessages?: Record<string, string>, customAttributes?: Record<string, string>): Promise<ValidationResult>;
}

export class Required extends Rule {}
export class Nullable extends Rule {}
export class StringRule extends Rule {}
export class NumberRule extends Rule {}
export class IntegerRule extends Rule {}
export class BooleanRule extends Rule {}
export class ArrayRule extends Rule {}
export class EmailRule extends Rule {}
export class MinRule extends Rule {}
export class MaxRule extends Rule {}
export class InRule extends Rule {}
export class ConfirmedRule extends Rule {}
export class AcceptedRule extends Rule {}
export class DateRule extends Rule {}
export class UrlRule extends Rule {}
export class UuidRule extends Rule {}
export class RegexRule extends Rule {}
export class JsonRule extends Rule {}
export class IpRule extends Rule {}
export class AlphaRule extends Rule {}
export class AlphaNumRule extends Rule {}
export class AlphaDashRule extends Rule {}
export class BetweenRule extends Rule {}
export class SameRule extends Rule {}
export class DifferentRule extends Rule {}
export class DigitsRule extends Rule {}
export class DigitsBetweenRule extends Rule {}
export class StartsWithRule extends Rule {}
export class EndsWithRule extends Rule {}
export class ContainsRule extends Rule {}
export class RequiredIf extends Rule {}
export class RequiredUnless extends Rule {}
export class Sometimes extends Rule {}
export class ExcludeIf extends Rule {}
