import HttpException from "./HttpException.js";
import NotFoundException from "./NotFoundException.js";
import ValidationException from "./ValidationException.js";
import UnauthorizedException from "./UnauthorizedException.js";

export default class ExceptionReporter {
    constructor() {
        this.reporters = [];
        this.ignoredClasses = new Set([
            NotFoundException,
            ValidationException,
            UnauthorizedException
        ]);
    }

    /**
     * Register an exception reporter function or class instance.
     * @param {Function|Object} reporter 
     * @returns {this}
     */
    register(reporter) {
        if (typeof reporter === "function" || (reporter && typeof reporter.report === "function")) {
            this.reporters.push(reporter);
        }
        return this;
    }

    /**
     * Ignore specific exception class from reporting.
     * @param {Function} exceptionClass 
     * @returns {this}
     */
    dontReport(exceptionClass) {
        if (typeof exceptionClass === "function") {
            this.ignoredClasses.add(exceptionClass);
        }
        return this;
    }

    /**
     * Check if exception should be reported.
     * @param {Error} error 
     * @returns {boolean}
     */
    shouldReport(error) {
        for (const ignoredClass of this.ignoredClasses) {
            if (error instanceof ignoredClass) {
                return false;
            }
        }
        return true;
    }

    /**
     * Report the exception to all registered reporters.
     * @param {Error} error 
     */
    report(error) {
        if (!this.shouldReport(error)) {
            return;
        }

        for (const reporter of this.reporters) {
            try {
                if (typeof reporter.report === "function") {
                    reporter.report(error);
                } else if (typeof reporter === "function") {
                    reporter(error);
                }
            } catch (err) {
                // Reporter failure should never crash the error handler
                console.error("[ExceptionReporter] Reporter threw error:", err);
            }
        }
    }
}
