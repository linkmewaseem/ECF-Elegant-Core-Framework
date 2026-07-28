import ValidationErrorBag from "./ValidationErrorBag.js";

export default class ValidationResult {
    constructor(validatedData = {}, errorBag = new ValidationErrorBag()) {
        this.validatedData = validatedData;
        this.errorBag = errorBag;
    }

    isValid() {
        return this.errorBag.isEmpty();
    }

    fails() {
        return !this.isValid();
    }

    errors() {
        return this.errorBag;
    }

    validated() {
        return this.validatedData;
    }

    throwIfFailed(ValidationExceptionClass) {
        if (this.fails()) {
            if (typeof ValidationExceptionClass === "function") {
                if (typeof ValidationExceptionClass.withErrors === "function") {
                    throw ValidationExceptionClass.withErrors(this.errorBag.all());
                }
                throw new ValidationExceptionClass(this.errorBag.all());
            }
            const err = new Error("Validation failed.");
            err.errors = this.errorBag.all();
            err.statusCode = 422;
            throw err;
        }
        return this.validatedData;
    }
}
