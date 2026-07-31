import { MiddlewareRegistry } from './MiddlewareRegistry.js';
import { MiddlewareResolver } from './MiddlewareResolver.js';
import { Pipeline } from '../Pipeline.js';

/**
 * Plugin-style Middleware Manager controlling registration, priority sorting, and onion execution.
 */
export class MiddlewareManager {
  constructor(container = null) {
    this.registry = new MiddlewareRegistry();
    this.resolver = new MiddlewareResolver(this.registry, container);
    this.priorityOrder = [];
  }

  /**
   * Register a named middleware alias.
   * @param {string} name
   * @param {any} middleware
   */
  register(name, middleware) {
    this.registry.register(name, middleware);
    return this;
  }

  /**
   * Define global middleware priority execution order.
   * @param {string[]} priorities
   */
  setPriority(priorities) {
    this.priorityOrder = priorities;
    return this;
  }

  /**
   * Create an executable pipeline for a given request and middleware stack.
   * @param {Array<string|Function|object>} stack
   * @returns {Pipeline}
   */
  createPipeline(stack = []) {
    const resolvedStack = this.resolver.resolveStack(stack);

    // Apply priority sorting if set
    if (this.priorityOrder.length > 0) {
      resolvedStack.sort((a, b) => {
        const indexA = this.priorityOrder.indexOf(a.name || '');
        const indexB = this.priorityOrder.indexOf(b.name || '');
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }

    const pipeline = new Pipeline();
    return pipeline.through(resolvedStack);
  }
}
