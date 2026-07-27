import { describe, test } from "node:test";
import assert from "node:assert/strict";

import HttpException from "../src/exceptions/HttpException.js";
import BadRequestException from "../src/exceptions/BadRequestException.js";
import UnauthorizedException from "../src/exceptions/UnauthorizedException.js";
import ForbiddenException from "../src/exceptions/ForbiddenException.js";
import NotFoundException from "../src/exceptions/NotFoundException.js";
import MethodNotAllowedException from "../src/exceptions/MethodNotAllowedException.js";
import CsrfException from "../src/exceptions/CsrfException.js";
import ValidationException from "../src/exceptions/ValidationException.js";
import RateLimitException from "../src/exceptions/RateLimitException.js";
import InternalServerException from "../src/exceptions/InternalServerException.js";
import ServiceUnavailableException from "../src/exceptions/ServiceUnavailableException.js";

describe("HttpException Hierarchy & Base Classes", () => {
    test("HttpException base class properties", () => {
        const cause = new Error("Underlying DB Connection Error");
        const exc = new HttpException(500, "Database Connection Failed", { "X-DB": "Offline" }, cause, { query: "SELECT 1" });

        assert.equal(exc.statusCode, 500);
        assert.equal(exc.message, "Database Connection Failed");
        assert.deepEqual(exc.headers, { "X-DB": "Offline" });
        assert.equal(exc.cause, cause);
        assert.deepEqual(exc.context, { query: "SELECT 1" });
        assert.ok(exc instanceof Error);
        assert.ok(exc instanceof HttpException);
    });

    test("BadRequestException (400)", () => {
        const exc = new BadRequestException();
        assert.equal(exc.statusCode, 400);
        assert.equal(exc.message, "Bad Request");
        assert.ok(exc instanceof HttpException);
    });

    test("UnauthorizedException (401)", () => {
        const exc = new UnauthorizedException("Token Expired");
        assert.equal(exc.statusCode, 401);
        assert.equal(exc.message, "Token Expired");
    });

    test("ForbiddenException (403)", () => {
        const exc = new ForbiddenException("Access Denied");
        assert.equal(exc.statusCode, 403);
        assert.equal(exc.message, "Access Denied");
    });

    test("NotFoundException (404)", () => {
        const exc = new NotFoundException("Resource not found");
        assert.equal(exc.statusCode, 404);
        assert.equal(exc.message, "Resource not found");
    });

    test("MethodNotAllowedException (405) with Allow header", () => {
        const exc = new MethodNotAllowedException("GET not supported", ["POST", "PUT"]);
        assert.equal(exc.statusCode, 405);
        assert.equal(exc.message, "GET not supported");
        assert.deepEqual(exc.allowedMethods, ["POST", "PUT"]);
        assert.equal(exc.headers["Allow"], "POST, PUT");
    });

    test("CsrfException (419)", () => {
        const exc = new CsrfException();
        assert.equal(exc.statusCode, 419);
        assert.equal(exc.message, "Page Expired");
    });

    test("ValidationException (422) with error bag", () => {
        const errors = { email: ["Email is required"], password: ["Password too short"] };
        const exc = ValidationException.withErrors(errors, "Validation Failed");

        assert.equal(exc.statusCode, 422);
        assert.equal(exc.message, "Validation Failed");
        assert.deepEqual(exc.errors, errors);
    });

    test("RateLimitException (429) with Retry-After header", () => {
        const exc = new RateLimitException("Too Many Requests", 60);
        assert.equal(exc.statusCode, 429);
        assert.equal(exc.retryAfter, 60);
        assert.equal(exc.headers["Retry-After"], "60");
    });

    test("InternalServerException (500)", () => {
        const exc = new InternalServerException();
        assert.equal(exc.statusCode, 500);
        assert.equal(exc.message, "Internal Server Error");
    });

    test("ServiceUnavailableException (503)", () => {
        const exc = new ServiceUnavailableException("System Under Maintenance");
        assert.equal(exc.statusCode, 503);
        assert.equal(exc.message, "System Under Maintenance");
    });
});
