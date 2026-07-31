import MiddlewareResolverError from "../errors/MiddlewareResolverError.js";

export class MiddlewareResolver {
  constructor(param1 = null, param2 = null) {
    if (!param1 || typeof param1 !== 'object') {
      throw new MiddlewareResolverError("Invalid router or registry passed to MiddlewareResolver.");
    }

    if (typeof param1.getMetadata === 'function') {
      // Legacy signature: constructor(router, registry)
      this.router = param1;
      if (!param2 || typeof param2 !== 'object' || (typeof param2.getGlobal !== 'function' && typeof param2.getNamed !== 'function')) {
        throw new MiddlewareResolverError("Invalid MiddlewareRegistry passed to MiddlewareResolver.");
      }
      this.registry = param2;
      this.container = null;
    } else if (typeof param1.getGlobal === 'function' || typeof param1.getNamed === 'function') {
      // Signature: constructor(registry, container)
      this.registry = param1;
      this.container = param2;
      this.router = null;
    } else {
      throw new MiddlewareResolverError("Invalid router or registry passed to MiddlewareResolver.");
    }
  }

  /**
   * Resolve a stack of middleware references into executable functions/instances.
   * @param {Array<string|Function|object>} stack
   * @returns {Array<Function|object>}
   */
  resolveStack(stack = []) {
    return stack.map(item => this.resolveItem(item));
  }

  /**
   * Resolve a single middleware reference (alias name with params, class, function).
   * @param {string|Function|object} item
   * @returns {Function|object}
   */
  resolveItem(item) {
    if (typeof item === 'string') {
      const [name, ...paramParts] = item.split(':');
      const params = paramParts.length > 0 ? paramParts.join(':').split(',') : [];

      let resolved = this.registry && typeof this.registry.getNamed === 'function'
        ? this.registry.getNamed(name)
        : null;

      if (!resolved && this.container?.has(name)) {
        resolved = this.container.make(name);
      }

      if (!resolved) {
        throw new MiddlewareResolverError(`Middleware alias [${name}] could not be resolved.`);
      }

      if (params.length > 0) {
        return async (req, next) => {
          if (typeof resolved === 'function') {
            return resolved(req, next, ...params);
          }
          if (typeof resolved.handle === 'function') {
            return resolved.handle(req, next, ...params);
          }
        };
      }

      return resolved;
    }

    if (typeof item === 'function' && item.prototype && typeof item.prototype.handle === 'function') {
      if (this.container) {
        return this.container.make(item);
      }
      return new item();
    }

    return item;
  }

  resolve(request, routerOverride = null) {
    if (!request || typeof request !== 'object' || typeof request.method !== 'string' || typeof request.path !== 'string') {
      throw new MiddlewareResolverError("Invalid route/request object passed to MiddlewareResolver.resolve().");
    }

    const targetRouter = routerOverride || this.router;
    const globalStack = this.registry && typeof this.registry.getGlobal === 'function'
      ? this.registry.getGlobal()
      : [];
    const routeMiddleware = targetRouter && typeof targetRouter.getMetadata === 'function'
      ? targetRouter.getMetadata(request.method, request.path).middleware
      : [];

    return this.resolveStack([...globalStack, ...routeMiddleware]);
  }
}

export default MiddlewareResolver;