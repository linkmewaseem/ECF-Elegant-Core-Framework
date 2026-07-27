import RequestError from "./errors/RequestError.js";
import AttributeBag from "./AttributeBag.js";
import lookup from "./utils/lookup.js";
import { URL } from "node:url";

export default class Request {
    #cache;
    #trustProxy = false;

    constructor(incomingMessage, bodyParserManager) {
        this.validateIncomingMessage(incomingMessage);
        this.validateBodyParserManager(bodyParserManager);

        this.raw = incomingMessage;
        this.bodyParserManager = bodyParserManager;
        this.attributes = new AttributeBag();

        this.#cache = {
            url: null,
            query: null,
            cookies: null,
            body: null,
            bodyParsed: false,
            headers: null
        };
    }

    /**
     * Enable or disable trusting proxy headers (X-Forwarded-For, CF-Connecting-IP, X-Real-IP).
     * @param {boolean} trust 
     * @returns {this}
     */
    setTrustProxy(trust = true) {
        this.#trustProxy = Boolean(trust);
        return this;
    }

    // ---- Basic request info ----

    get method() {
        return this.raw.method;
    }

    get url() {
        return this.raw.url;
    }

    get parsedUrl() {
        if (this.#cache.url === null) {
            const host = this.header("host") || "localhost";
            this.#cache.url = new URL(this.raw.url, `http://${host}`);
        }
        return this.#cache.url;
    }

    get path() {
        return this.parsedUrl.pathname;
    }

    get headers() {
        if (this.#cache.headers === null) {
            this.#cache.headers = Object.freeze({ ...this.raw.headers });
        }
        return this.#cache.headers;
    }

    header(name) {
        this.validateHeaderName(name);
        const key = name.trim().toLowerCase();
        return this.raw.headers[key] ?? null;
    }

    hasHeader(name) {
        this.validateHeaderName(name);
        const key = name.trim().toLowerCase();
        return Object.prototype.hasOwnProperty.call(this.raw.headers, key);
    }

    // ---- Query ----

    /**
     * Access query string parameters as an object (when called with no args) or via query(key, defaultValue).
     * @param {string|null} [key=null]
     * @param {any} [defaultValue=null]
     * @returns {Object|any}
     */
    query(key = null, defaultValue = null) {
        if (this.#cache.query === null) {
            this.#cache.query = Object.freeze(Object.fromEntries(this.parsedUrl.searchParams));
        }
        if (key === null || key === undefined) {
            return this.#cache.query;
        }
        return this.#cache.query[key] ?? lookup(this.#cache.query, key, defaultValue);
    }

    // ---- Params (set by Router, read by developer) ----

    get params() {
        const params = this.attributes.get("params", {});
        return Object.freeze({ ...params });
    }

    parameter(name, defaultValue = null) {
        return lookup(this.params, name, defaultValue);
    }

    param(name, defaultValue = null) {
        return this.parameter(name, defaultValue);
    }

    // ---- Cookies ----

    get cookies() {
        if (this.#cache.cookies === null) {
            this.#cache.cookies = Object.freeze(this.parseCookies());
        }
        return this.#cache.cookies;
    }

    cookie(name, defaultValue = null) {
        return this.cookies[name] ?? defaultValue;
    }

    hasCookie(name) {
        return Object.prototype.hasOwnProperty.call(this.cookies, name);
    }

    parseCookies() {
        const header = this.header("cookie");
        const result = {};

        if (!header) {
            return result;
        }

        for (const pair of header.split(";")) {
            const [key, ...rest] = pair.trim().split("=");
            if (!key) continue;

            const rawValue = rest.join("=") ?? "";

            try {
                result[key] = decodeURIComponent(rawValue);
            } catch {
                result[key] = rawValue; // malformed encoding — fall back to raw value
            }
        }

        return result;
    }

    // ---- Body (lazy, delegated to BodyParserManager) ----

    async body() {
        if (!this.#cache.bodyParsed) {
            try {
                this.#cache.body = await this.bodyParserManager.parse(this);
                this.#cache.bodyParsed = true;
            } catch (error) {
                this.#cache.body = null;
                this.#cache.bodyParsed = false; // don't cache a failed attempt
                throw error;
            }
        }
        return this.#cache.body;
    }

    // ---- Phase 1: Input & Data Manipulation Helpers ----

    /**
     * Returns unified input object combining route params, query parameters, and parsed body.
     */
    async all() {
        const parsedBody = await this.body();
        const bodyObj = (parsedBody && typeof parsedBody === "object") ? parsedBody : {};
        return Object.freeze({
            ...this.params,
            ...this.query(),
            ...bodyObj
        });
    }

    /**
     * Retrieve an input element from request (supports dot-notation lookup).
     */
    async input(key = null, defaultValue = null) {
        const inputs = await this.all();
        if (key === null || key === undefined) {
            return inputs;
        }
        return lookup(inputs, key, defaultValue);
    }

    /**
     * Get a subset of input data.
     */
    async only(...keys) {
        const flatKeys = keys.flat(Infinity);
        const inputs = await this.all();
        const result = {};
        for (const key of flatKeys) {
            const val = lookup(inputs, key, undefined);
            if (val !== undefined) {
                result[key] = val;
            }
        }
        return result;
    }

    /**
     * Get all input except specified keys.
     */
    async except(...keys) {
        const flatKeys = new Set(keys.flat(Infinity));
        const inputs = await this.all();
        const result = {};
        for (const [k, v] of Object.entries(inputs)) {
            if (!flatKeys.has(k)) {
                result[k] = v;
            }
        }
        return result;
    }

    /**
     * Determine if an input key is present.
     */
    async has(key) {
        const val = await this.input(key, undefined);
        return val !== undefined && val !== null;
    }

    /**
     * Determine if any of the given input keys are present.
     */
    async hasAny(...keys) {
        const flatKeys = keys.flat(Infinity);
        for (const k of flatKeys) {
            if (await this.has(k)) return true;
        }
        return false;
    }

    /**
     * Determine if an input key is present and not empty.
     */
    async filled(key) {
        const val = await this.input(key, undefined);
        if (val === undefined || val === null) return false;
        if (typeof val === "string") return val.trim() !== "";
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === "object") return Object.keys(val).length > 0;
        return true;
    }

    /**
     * Determine if an input key is missing.
     */
    async missing(key) {
        return !(await this.has(key));
    }

    // ---- Type Coercions ----

    async boolean(key, defaultValue = false) {
        const val = await this.input(key, defaultValue);
        if (typeof val === "boolean") return val;
        if (typeof val === "number") return val !== 0;
        if (typeof val === "string") {
            const lower = val.trim().toLowerCase();
            return ["true", "1", "on", "yes"].includes(lower);
        }
        return Boolean(val);
    }

    async integer(key, defaultValue = 0) {
        const val = await this.input(key, defaultValue);
        const parsed = parseInt(val, 10);
        return Number.isNaN(parsed) ? defaultValue : parsed;
    }

    async float(key, defaultValue = 0.0) {
        const val = await this.input(key, defaultValue);
        const parsed = parseFloat(val);
        return Number.isNaN(parsed) ? defaultValue : parsed;
    }

    async string(key, defaultValue = "") {
        const val = await this.input(key, defaultValue);
        return val !== null && val !== undefined ? String(val) : defaultValue;
    }

    async array(key, defaultValue = []) {
        const val = await this.input(key, defaultValue);
        if (Array.isArray(val)) return val;
        if (val === null || val === undefined) return defaultValue;
        return [val];
    }

    // ---- Phase 2: HTTP Method Helpers & Content Negotiation ----

    isMethod(method) {
        return typeof method === "string" && this.method.toUpperCase() === method.toUpperCase();
    }

    isGet() { return this.isMethod("GET"); }
    isPost() { return this.isMethod("POST"); }
    isPut() { return this.isMethod("PUT"); }
    isDelete() { return this.isMethod("DELETE"); }
    isPatch() { return this.isMethod("PATCH"); }
    isOptions() { return this.isMethod("OPTIONS"); }
    isHead() { return this.isMethod("HEAD"); }

    accepts(types) {
        const acceptHeader = this.header("accept");
        if (!acceptHeader) return true;
        const candidateTypes = Array.isArray(types) ? types : [types];
        const parsedAccepts = this.parseAcceptHeader(acceptHeader);

        for (const candidate of candidateTypes) {
            const normalized = this.normalizeMimeType(candidate);
            for (const acc of parsedAccepts) {
                if (acc.type === "*/*" || acc.type === normalized) return true;
                if (acc.type.endsWith("/*")) {
                    const group = acc.type.split("/")[0];
                    if (normalized.startsWith(group + "/")) return true;
                }
            }
        }
        return false;
    }

    prefers(types) {
        const acceptHeader = this.header("accept");
        const candidateTypes = Array.isArray(types) ? types : [types];
        if (!acceptHeader) return candidateTypes[0] ?? null;

        const parsedAccepts = this.parseAcceptHeader(acceptHeader);
        for (const acc of parsedAccepts) {
            for (const candidate of candidateTypes) {
                const normalized = this.normalizeMimeType(candidate);
                if (acc.type === "*/*" || acc.type === normalized) return candidate;
                if (acc.type.endsWith("/*")) {
                    const group = acc.type.split("/")[0];
                    if (normalized.startsWith(group + "/")) return candidate;
                }
            }
        }
        return null;
    }

    expectsJson() {
        return this.ajax() || this.accepts("json") || (this.header("accept")?.includes("json") ?? false);
    }

    ajax() {
        return this.header("x-requested-with")?.toLowerCase() === "xmlhttprequest";
    }

    pjax() {
        return this.hasHeader("x-pjax");
    }

    prefetch() {
        const purpose = this.header("purpose") || this.header("sec-purpose") || this.header("x-purpose");
        return purpose?.toLowerCase() === "prefetch";
    }

    parseAcceptHeader(headerStr) {
        return headerStr
            .split(",")
            .map((part) => {
                const [typeStr, ...params] = part.split(";");
                let q = 1.0;
                for (const p of params) {
                    const [k, v] = p.trim().split("=");
                    if (k === "q" && v) q = parseFloat(v) || 1.0;
                }
                return { type: typeStr.trim().toLowerCase(), q };
            })
            .sort((a, b) => b.q - a.q);
    }

    normalizeMimeType(type) {
        const map = {
            json: "application/json",
            html: "text/html",
            txt: "text/plain",
            xml: "application/xml",
            js: "application/javascript",
            form: "application/x-www-form-urlencoded"
        };
        return map[type.toLowerCase()] ?? type.toLowerCase();
    }

    // ---- Phase 3: Route Helpers ----

    route(key = null, defaultValue = null) {
        const routeObj = this.attributes.get("route", null);
        if (key === null || key === undefined) {
            return routeObj;
        }
        return lookup(routeObj, key, defaultValue);
    }

    routeName() {
        const r = this.route();
        return r?.name ?? null;
    }

    // ---- Phase 4: Network & Security Info (Trust Proxy) ----

    get ip() {
        if (this.#trustProxy) {
            const cfIp = this.header("cf-connecting-ip");
            if (cfIp) return cfIp.trim();

            const xForwardedFor = this.header("x-forwarded-for");
            if (xForwardedFor) {
                const firstIp = xForwardedFor.split(",")[0]?.trim();
                if (firstIp) return firstIp;
            }

            const realIp = this.header("x-real-ip");
            if (realIp) return realIp.trim();
        }

        return this.raw.socket?.remoteAddress ?? null;
    }

    get ips() {
        if (!this.#trustProxy) return [];
        const xForwardedFor = this.header("x-forwarded-for");
        if (!xForwardedFor) return [];
        return xForwardedFor.split(",").map((ip) => ip.trim()).filter(Boolean);
    }

    get protocol() {
        return this.secure ? "https" : "http";
    }

    get secure() {
        if (this.#trustProxy && this.header("x-forwarded-proto") === "https") {
            return true;
        }
        return this.header("x-forwarded-proto") === "https" || this.raw.socket?.encrypted === true;
    }

    get host() {
        return this.header("host") ?? null;
    }

    get origin() {
        return `${this.protocol}://${this.host}`;
    }

    get userAgent() {
        return this.header("user-agent") ?? null;
    }

    // ---- Phase 4: Uploaded Files ----

    async files() {
        const body = await this.body();
        if (body && typeof body === "object" && body.$files) {
            return body.$files;
        }
        return {};
    }

    async file(name) {
        const filesObj = await this.files();
        return lookup(filesObj, name, null);
    }

    // ---- Validation ----

    validateIncomingMessage(incomingMessage) {
        if (
            !incomingMessage ||
            typeof incomingMessage.method !== "string" ||
            typeof incomingMessage.url !== "string" ||
            typeof incomingMessage.headers !== "object" ||
            incomingMessage.headers === null
        ) {
            throw new RequestError("Request requires a valid IncomingMessage object.");
        }
    }

    validateBodyParserManager(bodyParserManager) {
        if (!bodyParserManager || typeof bodyParserManager.parse !== "function") {
            throw new RequestError("Request requires a BodyParserManager with a parse() method.");
        }
    }

    validateHeaderName(name) {
        if (typeof name !== "string" || name.trim() === "") {
            throw new RequestError("Header name must be a non-empty string.");
        }
    }
}