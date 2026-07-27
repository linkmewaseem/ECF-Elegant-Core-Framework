import { describe, test } from "node:test";
import assert from "node:assert/strict";

import ExceptionReporter from "../src/exceptions/ExceptionReporter.js";
import NotFoundException from "../src/exceptions/NotFoundException.js";
import ValidationException from "../src/exceptions/ValidationException.js";
import InternalServerException from "../src/exceptions/InternalServerException.js";

describe("ExceptionReporter - Logger Plugins & dontReport Filtering", () => {
    test("calls registered reporters for server errors", () => {
        const reportedErrors = [];
        const reporter = new ExceptionReporter();

        reporter.register((err) => reportedErrors.push(err.message));

        const err = new InternalServerException("DB Timeout");
        reporter.report(err);

        assert.equal(reportedErrors.length, 1);
        assert.equal(reportedErrors[0], "DB Timeout");
    });

    test("ignores exceptions listed in dontReport set (e.g. NotFoundException, ValidationException)", () => {
        const reportedErrors = [];
        const reporter = new ExceptionReporter();

        reporter.register((err) => reportedErrors.push(err.message));

        reporter.report(new NotFoundException("Page missing"));
        reporter.report(ValidationException.withErrors({ field: "Invalid" }));
        reporter.report(new InternalServerException("Server Crash"));

        assert.equal(reportedErrors.length, 1);
        assert.equal(reportedErrors[0], "Server Crash");
    });

    test("allows adding custom exception classes to dontReport", () => {
        class PaymentDeclinedException extends Error {}

        const reportedErrors = [];
        const reporter = new ExceptionReporter();
        reporter.dontReport(PaymentDeclinedException);
        reporter.register((err) => reportedErrors.push(err.message));

        reporter.report(new PaymentDeclinedException("Card declined"));
        assert.equal(reportedErrors.length, 0);
    });

    test("supports object reporters with .report() method", () => {
        const logs = [];
        const customPlugin = {
            report(err) {
                logs.push(`plugin:${err.message}`);
            }
        };

        const reporter = new ExceptionReporter();
        reporter.register(customPlugin);

        reporter.report(new InternalServerException("Error in Service"));

        assert.equal(logs.length, 1);
        assert.equal(logs[0], "plugin:Error in Service");
    });

    test("reporter throwing an error is isolated and does not break execution", () => {
        const reporter = new ExceptionReporter();
        reporter.register(() => {
            throw new Error("Sentry connection offline!");
        });

        assert.doesNotThrow(() => {
            reporter.report(new InternalServerException("Fatal error"));
        });
    });
});
