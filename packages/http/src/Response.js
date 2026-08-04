import { pipeline as streamPipeline } from "stream/promises";
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
        if (typeof this.raw.destroy !== "function") {
            this.raw.destroy = () => {};
        }
        this.statusCode = raw.statusCode ?? 200;
        this.context = Object.freeze({ ...context });
        this.#sent = false;
    }

    // ---- Basic Response Builders ----

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

    appendHeader(name, value) {
        this.assertNotSent();
        const trimmedName = this.normalizeHeaderName(name);
        this.validateHeaderValue(value);
        const existing = this.raw.getHeader(trimmedName);
        if (existing === undefined) {
            this.raw.setHeader(trimmedName, value);
        } else if (Array.isArray(existing)) {
            this.raw.setHeader(trimmedName, [...existing, value]);
        } else {
            this.raw.setHeader(trimmedName, [existing, value]);
        }
        return this;
    }

    contentType(type) {
        const mimeMap = {
            json: "application/json; charset=utf-8",
            html: "text/html; charset=utf-8",
            text: "text/plain; charset=utf-8",
            txt: "text/plain; charset=utf-8",
            css: "text/css; charset=utf-8",
            js: "application/javascript; charset=utf-8",
            xml: "application/xml; charset=utf-8",
            pdf: "application/pdf",
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            svg: "image/svg+xml"
        };
        const mime = mimeMap[type.toLowerCase()] ?? type;
        return this.header("Content-Type", mime);
    }

    // ---- Phase 2: Cookie API ----

    cookie(name, value, options = {}) {
        this.assertNotSent();
        if (typeof name !== "string" || !name.trim()) {
            throw new ResponseError("Cookie name must be a non-empty string.");
        }
        const serialized = this.serializeCookie(name.trim(), String(value ?? ""), options);
        this.appendHeader("Set-Cookie", serialized);
        return this;
    }

    clearCookie(name, options = {}) {
        return this.cookie(name, "", {
            ...options,
            expires: new Date(0),
            maxAge: 0
        });
    }

    serializeCookie(name, value, options = {}) {
        let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

        if (options.maxAge !== undefined && options.maxAge !== null) {
            const maxAge = Number(options.maxAge);
            if (!Number.isNaN(maxAge)) {
                cookieStr += `; Max-Age=${Math.floor(maxAge)}`;
            }
        }

        if (options.expires instanceof Date) {
            cookieStr += `; Expires=${options.expires.toUTCString()}`;
        } else if (typeof options.expires === "string") {
            cookieStr += `; Expires=${options.expires}`;
        }

        const path = options.path ?? "/";
        if (path) {
            cookieStr += `; Path=${path}`;
        }

        if (options.domain) {
            cookieStr += `; Domain=${options.domain}`;
        }

        if (options.secure) {
            cookieStr += "; Secure";
        }

        if (options.httpOnly !== false) {
            cookieStr += "; HttpOnly";
        }

        if (options.sameSite) {
            const sameSite = String(options.sameSite).toLowerCase();
            if (sameSite === "lax") cookieStr += "; SameSite=Lax";
            else if (sameSite === "strict") cookieStr += "; SameSite=Strict";
            else if (sameSite === "none") cookieStr += "; SameSite=None";
        }

        return cookieStr;
    }

    // ---- Phase 2: Cache & HTTP Header Helpers ----

    cacheControl(options = {}) {
        const directives = [];
        if (options.private) directives.push("private");
        else if (options.public) directives.push("public");

        if (options.noCache) directives.push("no-cache");
        if (options.noStore) directives.push("no-store");
        if (options.mustRevalidate) directives.push("must-revalidate");

        if (options.maxAge !== undefined && options.maxAge !== null) {
            directives.push(`max-age=${Number(options.maxAge)}`);
        }
        if (options.sMaxAge !== undefined && options.sMaxAge !== null) {
            directives.push(`s-maxage=${Number(options.sMaxAge)}`);
        }

        return this.header("Cache-Control", directives.join(", "));
    }

    noCache() {
        return this.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    }

    etag(value) {
        const val = String(value).startsWith('"') || String(value).startsWith('W/"') ? value : `"${value}"`;
        return this.header("ETag", val);
    }

    lastModified(date) {
        const dateObj = date instanceof Date ? date : new Date(date);
        return this.header("Last-Modified", dateObj.toUTCString());
    }

    vary(field) {
        return this.appendHeader("Vary", field);
    }

    // ---- Terminal Response Body Writers ----

    text(body) {
        this.validateStringBody(body, "text");
        this.contentType("text");
        return this.send(body);
    }

    html(body) {
        this.validateStringBody(body, "html");
        this.contentType("html");
        return this.send(body);
    }

    json(data) {
        const serialized = this.serializeJson(data);
        this.contentType("json");
        return this.send(serialized);
    }

    noContent(status = 204) {
        this.status(status);
        return this.send(null);
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

    // ---- Streams & Files ----

    async stream(readableStream, options = {}) {
        this.assertNotSent();
        if (
            !readableStream ||
            (typeof readableStream[Symbol.asyncIterator] !== "function" && typeof readableStream.pipe !== "function")
        ) {
            throw new ResponseError("stream() requires a valid Readable stream.");
        }

        if (options.contentType) {
            this.contentType(options.contentType);
        }

        this.raw.statusCode = this.statusCode;
        const raw = this.raw;
        const isWritable = typeof raw.write === "function" && typeof raw.end === "function";

        if (isWritable) {
            try {
                await streamPipeline(readableStream, raw);
                this.#sent = true;
                return this;
            } catch (error) {
                if (!raw.headersSent) {
                    raw.statusCode = 500;
                }
                if (typeof raw.end === "function") {
                    raw.end();
                }
                throw error;
            }
        }

        const chunks = [];
        try {
            if (typeof readableStream[Symbol.asyncIterator] === "function") {
                for await (const chunk of readableStream) {
                    if (typeof chunk === "string") {
                        chunks.push(Buffer.from(chunk));
                    } else if (Buffer.isBuffer(chunk)) {
                        chunks.push(chunk);
                    } else {
                        chunks.push(Buffer.from(chunk));
                    }
                }
            } else {
                await new Promise((resolve, reject) => {
                    readableStream.on("data", (chunk) => {
                        if (typeof chunk === "string") {
                            chunks.push(Buffer.from(chunk));
                        } else if (Buffer.isBuffer(chunk)) {
                            chunks.push(chunk);
                        } else {
                            chunks.push(Buffer.from(chunk));
                        }
                    });
                    readableStream.on("end", resolve);
                    readableStream.on("error", reject);
                });
            }

            const data = Buffer.concat(chunks);
            if (typeof raw.setHeader === "function") {
                try {
                    raw.setHeader("Content-Length", String(data.length));
                } catch (error) {
                    // ignore if setHeader is unsupported or headers already sent
                }
            }

            if (typeof raw.end === "function") {
                raw.end(data);
            } else {
                raw.body = data;
                raw.headersSent = true;
            }

            this.#sent = true;
            return this;
        } catch (error) {
            if (!raw.headersSent) {
                raw.statusCode = 500;
            }
            if (typeof raw.end === "function") {
                raw.end();
            }
            throw error;
        }
    }

    async download(filePath, filename = null, options = {}) {
        this.assertNotSent();
        const path = await import("node:path");
        const fs = await import("node:fs");

        if (!fs.existsSync(filePath)) {
            throw new ResponseError(`Download file not found at path "${filePath}".`);
        }

        const targetName = filename ?? path.basename(filePath);
        const encodedName = encodeURIComponent(targetName);
        const disposition = `attachment; filename="${targetName}"; filename*=UTF-8''${encodedName}`;

        this.header("Content-Disposition", disposition);

        const ext = path.extname(targetName).slice(1);
        if (ext) {
            this.contentType(ext);
        }

        const readStream = fs.createReadStream(filePath);
        return this.stream(readStream, options);
    }

    async file(filePath, options = {}) {
        this.assertNotSent();
        const path = await import("node:path");
        const fs = await import("node:fs");

        if (!fs.existsSync(filePath)) {
            throw new ResponseError(`File not found at path "${filePath}".`);
        }

        const ext = path.extname(filePath).slice(1);
        if (ext) {
            this.contentType(ext);
        }

        const readStream = fs.createReadStream(filePath);
        return this.stream(readStream, options);
    }

    async sendFile(filePath, options = {}) {
        return this.file(filePath, options);
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