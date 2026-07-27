import RouteError from "./errors/RouteError.js";
import RouterError from "./errors/RouterError.js";
import DuplicateRouteError from "./errors/DuplicateRouteError.js";
import RouteNotFoundError from "./errors/RouteNotFoundError.js";
import Route from "./Route.js";

const VALID_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export default class Router {
    #groupStack = [];

    constructor() {
        this.routes = new Map();
        this.metadata = new Map();
        this.namedRoutes = new Map();
        this.fallbackRoute = null;
    }

    // ---- Group Stack Engine ----

    group(options, callback) {
        if (typeof options === "string") {
            options = { prefix: options };
        } else if (typeof options !== "object" || options === null) {
            throw new RouterError("Group options must be a string prefix or configuration object.");
        }

        if (typeof callback !== "function") {
            throw new RouterError("Group requires a callback function.");
        }

        const parentGroup = this.#groupStack[this.#groupStack.length - 1] ?? {
            prefix: "",
            middleware: [],
            domain: null,
            as: ""
        };

        let rawPrefix = (parentGroup.prefix + "/" + (options.prefix ?? "")).replace(/\/+/g, "/");
        if (rawPrefix.length > 1 && rawPrefix.endsWith("/")) {
            rawPrefix = rawPrefix.slice(0, -1);
        }
        const formattedPrefix = rawPrefix.startsWith("/") ? rawPrefix : "/" + rawPrefix;

        const parentMw = parentGroup.middleware ?? [];
        const groupMw = options.middleware ? (Array.isArray(options.middleware) ? options.middleware : [options.middleware]) : [];
        const middleware = [...parentMw, ...groupMw];

        const domain = options.domain ?? parentGroup.domain ?? null;
        const as = (parentGroup.as ?? "") + (options.as ?? "");

        const groupState = { prefix: formattedPrefix === "/" ? "" : formattedPrefix, middleware, domain, as };

        this.#groupStack.push(groupState);
        try {
            callback(this);
        } finally {
            this.#groupStack.pop();
        }

        return this;
    }

    registerNamedRoute(name, route) {
        if (this.namedRoutes.has(name) && this.namedRoutes.get(name) !== route) {
            throw new RouterError(`Route name "${name}" is already registered.`);
        }
        this.namedRoutes.set(name, route);
    }

    syncMetadata(route) {
        this.setMetadata(route.method, route.path, {
            middleware: route.middleware()
        });
    }

    findByName(name) {
        return this.namedRoutes.get(name) ?? null;
    }

    url(name, params = {}, query = {}) {
        const route = this.findByName(name);
        if (!route) {
            throw new RouterError(`Route with name "${name}" not found.`);
        }
        return route.compileUrl(params, query);
    }

    // ---- Helper Methods ----

    makeRouteKey(method, path) {
        return `${method.toUpperCase()}:${path}`;
    }

    setMetadata(method, path, metadata) {
        const key = this.makeRouteKey(method, path);

        if (!this.metadata.has(key)) {
            this.metadata.set(key, {
                middleware: []
            });
        }

        Object.assign(this.metadata.get(key), metadata);
    }

    getMetadata(method, path) {
        const key = this.makeRouteKey(method, path);

        return this.metadata.get(key) ?? {
            middleware: []
        };
    }

    // ---- Public HTTP Registration API ----

    get(path, ...args) {
        return this.addRoute("GET", path, ...args);
    }

    post(path, ...args) {
        return this.addRoute("POST", path, ...args);
    }

    put(path, ...args) {
        return this.addRoute("PUT", path, ...args);
    }

    patch(path, ...args) {
        return this.addRoute("PATCH", path, ...args);
    }

    delete(path, ...args) {
        return this.addRoute("DELETE", path, ...args);
    }

    head(path, ...args) {
        return this.addRoute("HEAD", path, ...args);
    }

    options(path, ...args) {
        return this.addRoute("OPTIONS", path, ...args);
    }

    any(path, ...args) {
        for (const method of VALID_METHODS) {
            this.addRoute(method, path, ...args);
        }

        return this;
    }

    // ---- Resource & Fallback API ----

    resource(name, ControllerClass, options = {}) {
        const resourceName = name.replace(/^\//, "").replace(/\/$/, "");
        const paramName = resourceName.split("/").pop().replace(/s$/, ""); // e.g. "photos" -> "photo"

        const routes = {
            index: { method: "GET", path: `/${resourceName}`, action: "index" },
            create: { method: "GET", path: `/${resourceName}/create`, action: "create" },
            store: { method: "POST", path: `/${resourceName}`, action: "store" },
            show: { method: "GET", path: `/${resourceName}/{${paramName}}`, action: "show" },
            edit: { method: "GET", path: `/${resourceName}/{${paramName}}/edit`, action: "edit" },
            update: { method: "PUT", path: `/${resourceName}/{${paramName}}`, action: "update" },
            destroy: { method: "DELETE", path: `/${resourceName}/{${paramName}}`, action: "destroy" }
        };

        const only = options.only ? new Set(options.only) : null;
        const except = options.except ? new Set(options.except) : null;

        for (const [actionKey, spec] of Object.entries(routes)) {
            if (only && !only.has(actionKey)) continue;
            if (except && except.has(actionKey)) continue;

            const instance = typeof ControllerClass === "function" ? ControllerClass : null;
            if (instance && typeof instance.prototype[spec.action] === "function") {
                const route = this.addRoute(spec.method, spec.path, [ControllerClass, spec.action]);
                route.name(`${resourceName}.${actionKey}`);
            }
        }
        return this;
    }

    apiResource(name, ControllerClass, options = {}) {
        const except = new Set(options.except ?? []);
        except.add("create");
        except.add("edit");
        return this.resource(name, ControllerClass, { ...options, except: Array.from(except) });
    }

    fallback(handler) {
        this.fallbackRoute = new Route("GET", "/{__fallback__}", handler, { router: this });
        return this.fallbackRoute;
    }

    redirect(from, to, status = 302) {
        return this.get(from, (req, res) => {
            return res.redirect(to, status);
        });
    }

    match(request) {
        this.validateRequest(request);

        const method = request.method;
        const path = request.path;

        this.validateMethod(method);
        this.validatePath(path);

        const route = this.resolve(method, path);

        if (!route.matched) {
            throw new RouteNotFoundError(method, path);
        }

        request.attributes.set("params", route.params);

        return route.route;
    }

    // ---- Registration Engine ----

    addRoute(method, path, ...args) {
        const currentGroup = this.#groupStack[this.#groupStack.length - 1];

        let fullPath = path;
        let groupMw = [];
        let groupDomain = null;
        let groupAs = "";

        if (currentGroup) {
            groupMw = currentGroup.middleware ?? [];
            groupDomain = currentGroup.domain ?? null;
            groupAs = currentGroup.as ?? "";

            if (currentGroup.prefix) {
                const p = currentGroup.prefix.endsWith("/") ? currentGroup.prefix.slice(0, -1) : currentGroup.prefix;
                const rel = path.startsWith("/") ? path : "/" + path;
                fullPath = p + rel;
            }
        }

        const { middleware, handler } = this.normalizeArgs(args);
        const combinedMiddleware = [...groupMw, ...middleware];

        const route = new Route(method, fullPath, handler, {
            router: this,
            middleware: combinedMiddleware,
            domain: groupDomain
        });

        this.assertNotDuplicate(route);

        if (!this.routes.has(route.method)) {
            this.routes.set(route.method, []);
        }

        this.routes.get(route.method).push(route);

        this.setMetadata(method, fullPath, {
            middleware: route.middleware()
        });

        this.lastRoute = route;

        if (groupAs) {
            const defaultName = groupAs + fullPath.replace(/\//g, ".").replace(/^\./, "");
            route.name(defaultName);
        }

        return this;
    }

    name(routeName) {
        if (this.lastRoute) {
            this.lastRoute.name(routeName);
        }
        return this;
    }

    where(nameOrObj, pattern = null) {
        if (this.lastRoute) {
            this.lastRoute.where(nameOrObj, pattern);
        }
        return this;
    }

    normalizeArgs(args) {
        if (args.length === 1) {
            return {
                middleware: [],
                handler: args[0]
            };
        }

        const [middlewareArg, handler] = args;

        return {
            middleware: Array.isArray(middlewareArg)
                ? middlewareArg
                : [middlewareArg],
            handler
        };
    }

    // ---- Internal Helpers ----

    resolve(method, path) {
        const upperMethod = method.toUpperCase();
        let candidates = this.routes.get(upperMethod);

        if ((!candidates || candidates.length === 0) && upperMethod === "HEAD") {
            candidates = this.routes.get("GET");
        }

        if (candidates && candidates.length > 0) {
            const segmentCount = this.countSegments(path);

            for (const route of candidates) {
                if (route.segmentCount !== segmentCount) {
                    continue;
                }

                if (!path.startsWith(route.staticPrefix)) {
                    continue;
                }

                const params = route.match(path);
                if (params !== null) {
                    return { matched: true, route, params };
                }
            }
        }

        if (this.fallbackRoute) {
            return { matched: true, route: this.fallbackRoute, params: {} };
        }

        return { matched: false };
    }

    countSegments(path) {
        return path.split("/").filter(Boolean).length;
    }

    assertNotDuplicate(route) {
        const existing = this.routes.get(route.method);
        if (!existing) return;

        const isDuplicate = existing.some((r) => r.path === route.path);
        if (isDuplicate) {
            throw new DuplicateRouteError(route.method, route.path);
        }
    }

    // ---- Validation ----

    validateRequest(request) {
        if (
            !request ||
            typeof request.method !== "string" ||
            typeof request.path !== "string" ||
            !request.attributes ||
            typeof request.attributes.set !== "function"
        ) {
            throw new RouteError("Router.match() requires a valid Request object with method, path, and attributes.");
        }
    }

    validateMethod(method) {
        if (typeof method !== "string" || !VALID_METHODS.includes(method.toUpperCase())) {
            throw new RouteError(`Invalid HTTP method "${method}".`);
        }
    }

    validatePath(path) {
        if (typeof path !== "string" || path.trim() === "" || !path.startsWith("/")) {
            throw new RouteError(`Path must be a non-empty string starting with "/". Got "${path}".`);
        }
    }
}