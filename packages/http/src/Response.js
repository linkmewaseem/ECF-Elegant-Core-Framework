import ResponseError from "./errors/ResponseError.js";

const MIN_STATUS = 100;
const MAX_STATUS = 599;
const DEFAULT_REDIRECT_STATUS = 302;

export default class Response {
    #sent;

    constructor(raw, context = {}) {
        this.validateRaw(raw);
        this.validateContext(context);

        this.raw = raw;
        this.statusCode = raw.statusCode ?? 200;
        this.context = Object.freeze({ ...context });
        this.#sent = false;
    }

    // ---- Public API ----

    status(code) {
        this.assertNotSent();
        this.validateStatus(code);
        this.statusCode = code;
        this.raw.statusCode = code;
        return this;
    }

    header(name, value) {
        this.assertNotSent();
        const trimmedName = this.normalizeHeaderName(name);
        this.validateHeaderValue(value);
        this.raw.setHeader(trimmedName, value);
        return this;
    }

    setHeader(name, value) {
        return this.header(name, value);
    }

    getHeader(name) {
        const trimmedName = this.normalizeHeaderName(name);
        return this.raw.getHeader(trimmedName);
    }

    hasHeader(name) {
        const trimmedName = this.normalizeHeaderName(name);
        return this.raw.getHeader(trimmedName) !== undefined;
    }

    removeHeader(name) {
        this.assertNotSent();
        const trimmedName = this.normalizeHeaderName(name);
        this.raw.removeHeader(trimmedName);
        return this;
    }

    text(body) {
        this.validateStringBody(body, "text");
        this.header("Content-Type", "text/plain; charset=utf-8");
        return this.send(body);
    }

    html(body) {
        this.validateStringBody(body, "html");
        this.header("Content-Type", "text/html; charset=utf-8");
        return this.send(body);
    }

    json(data) {
        const serialized = this.serializeJson(data);
        this.header("Content-Type", "application/json; charset=utf-8");
        return this.send(serialized);
    }

    async view(name, data = {}) {
        if (!this.has("view")) {
            throw new ResponseError("No view engine registered. Did you forget to register a ViewServiceProvider?");
        }

        const html = await this.get("view").render(name, data);
        return this.html(html);
    }

    send(body = null) {
        this.assertNotSent();
        this.validateBody(body);

        if (body === null) {
            return this.sendRaw(body);
        }

        if (Buffer.isBuffer(body)) {
            return this.sendRaw(body);
        }

        if (typeof body === "object") {
            return this.json(body);
        }

        return this.sendRaw(body);
    }

    redirect(url, status = DEFAULT_REDIRECT_STATUS) {
        this.validateRedirectUrl(url);
        this.validateRedirectStatus(status);

        this.status(status);
        this.header("Location", url);
        return this.send();
    }

    end() {
        this.assertNotSent();
        this.raw.statusCode = this.statusCode;
        this.raw.end();
        this.#sent = true;
        return this;
    }

    get headersSent() {
        return this.#sent || this.raw.headersSent === true;
    }

    // ---- Context helpers ----

    has(key) {
        return this.context[key] !== undefined && this.context[key] !== null;
    }

    get(key) {
        return this.context[key];
    }

    // ---- Internal helpers ----

    sendRaw(body) {
        this.raw.statusCode = this.statusCode;
        this.raw.end(body ?? undefined);
        this.#sent = true;
        return this;
    }

    serializeJson(data) {
        try {
            return JSON.stringify(data);
        } catch (error) {
            throw new ResponseError(`Failed to serialize JSON body: ${error.message}`);
        }
    }

    normalizeHeaderName(name) {
        this.validateHeaderName(name);
        return name.trim();
    }

    assertNotSent() {
        if (this.headersSent) {
            throw new ResponseError("Response has already been sent.");
        }
    }

    // ---- Validation ----

    validateRaw(raw) {
        if (
            !raw ||
            typeof raw.setHeader !== "function" ||
            typeof raw.getHeader !== "function" ||
            typeof raw.removeHeader !== "function" ||
            typeof raw.end !== "function"
        ) {
            throw new ResponseError("Response requires a valid ServerResponse-like object.");
        }
    }

    validateContext(context) {
        if (context === null || typeof context !== "object") {
            throw new ResponseError("Response context must be a plain object.");
        }

        if (context.view !== undefined && context.view !== null) {
            if (typeof context.view.render !== "function") {
                throw new ResponseError("Response context 'view' must implement render().");
            }
        }
    }

    validateStatus(code) {
        if (typeof code !== "number" || !Number.isInteger(code) || code < MIN_STATUS || code > MAX_STATUS) {
            throw new ResponseError(`Invalid status code "${code}". Must be an integer between ${MIN_STATUS} and ${MAX_STATUS}.`);
        }
    }

    validateHeaderName(name) {
        if (typeof name !== "string" || name.trim() === "") {
            throw new ResponseError("Header name must be a non-empty string.");
        }
    }

    validateHeaderValue(value) {
        const validTypes = ["string", "number", "boolean"];
        if (!validTypes.includes(typeof value)) {
            throw new ResponseError("Header value must be a string, number, or boolean.");
        }
    }

    validateStringBody(body, type) {
        if (typeof body !== "string") {
            throw new ResponseError(`${type}() requires a string body.`);
        }
    }

    validateBody(body) {
        const unsupportedTypes = ["symbol", "function", "bigint"];
        if (unsupportedTypes.includes(typeof body)) {
            throw new ResponseError(`Response body of type "${typeof body}" is not supported.`);
        }
    }

    validateRedirectUrl(url) {
        if (typeof url !== "string" || url.trim() === "") {
            throw new ResponseError("Redirect URL must be a non-empty string.");
        }
    }

    validateRedirectStatus(status) {
        if (status < 300 || status > 399) {
            throw new ResponseError(`Invalid redirect status "${status}". Must be between 300 and 399.`);
        }
        this.validateStatus(status);
    }
}