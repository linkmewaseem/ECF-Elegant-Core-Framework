import RouteError from "./errors/RouteError.js";

const VALID_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const SEGMENT_PATTERN = "([^/]+)";

export default class Route {
    #method;
    #path;
    #handler;
    #router;
    #name;
    #middlewareList;
    #constraintsMap;
    #domain;
    #prefix;
    #defaultsMap;
    #regex;
    #parameterNames;
    #segmentCount;
    #staticPrefix;

    constructor(method, path, handler, options = {}) {
        this.validateMethod(method);
        this.validatePath(path);
        this.validateHandler(handler);

        this.#method = method.toUpperCase();
        this.#path = path;
        this.#handler = this.normalizeHandler(handler);
        this.#router = options.router ?? null;

        this.#name = options.name ?? null;
        this.#middlewareList = options.middleware ? [...options.middleware] : [];
        this.#constraintsMap = { ...(options.constraints ?? {}) };
        this.#domain = options.domain ?? null;
        this.#prefix = options.prefix ?? null;
        this.#defaultsMap = { ...(options.defaults ?? {}) };

        this.recompile();

        Object.freeze(this);
    }

    get method() { return this.#method; }
    get path() { return this.#path; }
    get handler() { return this.#handler; }
    get router() { return this.#router; }
    get nameVal() { return this.#name; }
    get domain() { return this.#domain; }
    get constraints() { return this.#constraintsMap; }
    get defaults() { return this.#defaultsMap; }
    get regex() { return this.#regex; }
    get parameterNames() { return this.#parameterNames; }
    get segmentCount() { return this.#segmentCount; }
    get staticPrefix() { return this.#staticPrefix; }

    name(routeName) {
        if (routeName === undefined) {
            return this.#name;
        }
        if (typeof routeName !== "string" || !routeName.trim()) {
            throw new RouteError("Route name must be a non-empty string.");
        }
        this.#name = routeName.trim();
        if (this.#router && typeof this.#router.registerNamedRoute === "function") {
            this.#router.registerNamedRoute(this.#name, this);
        }
        return this;
    }

    where(nameOrObj, pattern = null) {
        if (typeof nameOrObj === "object" && nameOrObj !== null) {
            for (const [key, p] of Object.entries(nameOrObj)) {
                this.#constraintsMap[key] = p;
            }
        } else if (typeof nameOrObj === "string") {
            if (pattern === null || pattern === undefined) {
                throw new RouteError(`Constraint pattern for "${nameOrObj}" cannot be null.`);
            }
            this.#constraintsMap[nameOrObj] = pattern;
        }
        this.recompile();
        return this;
    }

    middleware(...mw) {
        if (mw.length === 0) {
            return [...this.#middlewareList];
        }
        const flat = mw.flat(Infinity);
        this.#middlewareList.push(...flat);
        if (this.#router && typeof this.#router.syncMetadata === "function") {
            this.#router.syncMetadata(this);
        }
        return this;
    }

    domain(domainName) {
        if (domainName === undefined) return this.#domain;
        this.#domain = domainName;
        return this;
    }

    // ---- Router Method Delegation Helpers ----

    get(path, ...args) { return this.#router ? this.#router.get(path, ...args) : this; }
    post(path, ...args) { return this.#router ? this.#router.post(path, ...args) : this; }
    put(path, ...args) { return this.#router ? this.#router.put(path, ...args) : this; }
    patch(path, ...args) { return this.#router ? this.#router.patch(path, ...args) : this; }
    delete(path, ...args) { return this.#router ? this.#router.delete(path, ...args) : this; }
    head(path, ...args) { return this.#router ? this.#router.head(path, ...args) : this; }
    options(path, ...args) { return this.#router ? this.#router.options(path, ...args) : this; }

    recompile() {
        const compiled = this.compile(this.#path);
        this.#regex = compiled.regex;
        this.#parameterNames = compiled.parameterNames;
        this.#segmentCount = compiled.segmentCount;
        this.#staticPrefix = compiled.staticPrefix;
    }

    // ---- Compilation (runs at construction & recompile time) ----

    compile(path) {
        const parameterNames = [];
        const segments = path.split("/").filter(Boolean);

        const staticSegments = [];
        for (const segment of segments) {
            if (segment.startsWith("{") && segment.endsWith("}")) {
                break;
            }
            staticSegments.push(segment);
        }
        const staticPrefix = "/" + staticSegments.join("/");

        const regexBody = segments
            .map((segment) => {
                const match = segment.match(/^\{([a-zA-Z_][a-zA-Z0-9_]*)\}$/);
                if (match) {
                    const paramName = match[1];
                    parameterNames.push(paramName);

                    const constraint = this.#constraintsMap[paramName];
                    if (constraint) {
                        let constraintPattern;
                        if (constraint instanceof RegExp) {
                            constraintPattern = constraint.source.replace(/^\^|\$$/g, "");
                        } else {
                            constraintPattern = String(constraint);
                        }
                        return `(${constraintPattern})`;
                    }
                    return SEGMENT_PATTERN;
                }
                return this.escapeRegex(segment);
            })
            .join("/");

        const regex = new RegExp(`^/${regexBody}$`);

        return {
            regex,
            parameterNames,
            segmentCount: segments.length,
            staticPrefix
        };
    }

    escapeRegex(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    normalizeHandler(handler) {
        if (typeof handler === "function") {
            return handler;
        }

        // [Controller, "methodName"] form
        const [ControllerClass, methodName] = handler;
        const instance = new ControllerClass();

        if (typeof instance[methodName] !== "function") {
            throw new RouteError(`Controller method "${methodName}" does not exist on ${ControllerClass.name}.`);
        }

        return instance[methodName].bind(instance);
    }

    // ---- Matching ----

    match(path) {
        const result = this.#regex.exec(path);
        if (!result) {
            return null;
        }

        const params = { ...this.#defaultsMap };
        this.#parameterNames.forEach((name, index) => {
            params[name] = result[index + 1];
        });

        return params;
    }

    // ---- URL Generation ----

    compileUrl(params = {}, query = {}) {
        let compiledPath = this.#path;
        for (const name of this.#parameterNames) {
            const val = params[name] ?? this.#defaultsMap[name];
            if (val === undefined || val === null) {
                throw new RouteError(`Missing required parameter "${name}" for route "${this.#name ?? this.#path}".`);
            }
            compiledPath = compiledPath.replace(`{${name}}`, encodeURIComponent(String(val)));
        }

        const queryEntries = Object.entries(query);
        if (queryEntries.length > 0) {
            const searchParams = new URLSearchParams();
            for (const [k, v] of queryEntries) {
                if (v !== null && v !== undefined) {
                    searchParams.append(k, String(v));
                }
            }
            const queryString = searchParams.toString();
            if (queryString) {
                compiledPath += `?${queryString}`;
            }
        }

        return compiledPath;
    }

    // ---- Validation ----

    validateMethod(method) {
        if (typeof method !== "string" || !VALID_METHODS.includes(method.toUpperCase())) {
            throw new RouteError(`Invalid HTTP method "${method}".`);
        }
    }

    validatePath(path) {
        if (typeof path !== "string" || path.trim() === "" || !path.startsWith("/")) {
            throw new RouteError(`Route path must be a non-empty string starting with "/". Got "${path}".`);
        }
    }

    validateHandler(handler) {
        const isFunction = typeof handler === "function";
        const isControllerTuple =
            Array.isArray(handler) &&
            handler.length === 2 &&
            typeof handler[0] === "function" &&
            typeof handler[1] === "string";

        if (!isFunction && !isControllerTuple) {
            throw new RouteError("Route handler must be a function or a [Controller, \"method\"] tuple.");
        }
    }
}