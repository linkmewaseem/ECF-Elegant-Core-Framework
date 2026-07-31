import MiddlewareRegistryError from "../errors/MiddlewareRegistryError.js";
import Middleware from "../Middleware.js";

export class MiddlewareRegistry {
  constructor() {
    this.globalMiddleware = new Set();
    this.namedMiddleware = new Map();
  }

  // ---- Global middleware ----

  global(middleware) {
    this.validateMiddleware(middleware);
    this.globalMiddleware.add(middleware);
    return this;
  }

  getGlobal() {
    return [...this.globalMiddleware];
  }

  // ---- Named middleware ----

  register(name, middleware) {
    this.validateMiddleware(middleware);
    this.namedMiddleware.set(name, middleware);
    return this;
  }

  getNamed(name) {
    return this.namedMiddleware.get(name) || null;
  }

  hasNamed(name) {
    return this.namedMiddleware.has(name);
  }

  // ---- Validation ----

  validateMiddleware(middleware) {
    const isFunction = typeof middleware === "function";
    const isMiddlewareInstance = middleware instanceof Middleware;
    const isObjectWithHandle = middleware && typeof middleware.handle === "function";

    if (!isFunction && !isMiddlewareInstance && !isObjectWithHandle) {
      throw new MiddlewareRegistryError("Middleware must be a function, an object with handle(), or a Middleware instance.");
    }
  }
}

export default MiddlewareRegistry;