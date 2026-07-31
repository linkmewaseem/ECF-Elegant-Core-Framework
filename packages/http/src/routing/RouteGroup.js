/**
 * Builder for nested route groups with prefix, domain, middleware inheritance.
 */
export class RouteGroup {
  /**
   * @param {object} attributes { prefix, middleware, domain }
   * @param {Function} callback
   */
  constructor(attributes, callback) {
    this.prefix = attributes.prefix || '';
    this.middleware = Array.isArray(attributes.middleware)
      ? attributes.middleware
      : (attributes.middleware ? [attributes.middleware] : []);
    this.domain = attributes.domain || null;
    this.callback = callback;
  }

  /**
   * Execute callback and bind attributes to group context.
   * @param {import('../Router.js').Router} router
   */
  register(router) {
    router.pushGroupContext({
      prefix: this.prefix,
      middleware: this.middleware,
      domain: this.domain
    });

    try {
      this.callback(router);
    } finally {
      router.popGroupContext();
    }
  }
}
