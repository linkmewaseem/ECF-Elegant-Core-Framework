import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Context Manager for Log Records.
 * Manages request/execution contextual storage via AsyncLocalStorage, static values,
 * lazy evaluation functions, and OpenTelemetry trace auto-extraction.
 */
export class LogContext {
  static #als = new AsyncLocalStorage();
  static #globalContext = {};

  /**
   * Run a function within a contextual scope.
   * @param {Object|Function} context - Object or lazy evaluator callback returning context
   * @param {Function} callback
   */
  static withContext(context, callback) {
    const parent = LogContext.#als.getStore() || {};
    const store = { parent, context };
    return LogContext.#als.run(store, callback);
  }

  /**
   * Set persistent global context.
   * @param {Object} context
   */
  static setGlobalContext(context = {}) {
    LogContext.#globalContext = { ...LogContext.#globalContext, ...context };
  }

  /**
   * Get active global context.
   */
  static getGlobalContext() {
    return { ...LogContext.#globalContext };
  }

  /**
   * Resolve active context (combining global context, ALS context chain, lazy context callbacks, and OpenTelemetry trace IDs).
   * @returns {Object}
   */
  static getActiveContext() {
    const contextChain = [];
    let current = LogContext.#als.getStore();

    while (current) {
      if (current.context) {
        contextChain.unshift(current.context);
      }
      current = current.parent;
    }

    let merged = { ...LogContext.#globalContext };

    for (const ctxItem of contextChain) {
      const evaluated = typeof ctxItem === 'function' ? ctxItem() : ctxItem;
      if (evaluated && typeof evaluated === 'object') {
        merged = { ...merged, ...evaluated };
      }
    }

    // Auto-extract OpenTelemetry / Observability trace context if available
    const oTelContext = LogContext.extractOpenTelemetryContext();
    if (oTelContext) {
      merged = { ...oTelContext, ...merged };
    }

    return merged;
  }

  /**
   * Extract OpenTelemetry / Observability active trace IDs from global or AsyncLocalStorage context.
   * Checks global Tracer or global context.
   */
  static extractOpenTelemetryContext() {
    try {
      if (globalThis.__ECF_TRACER__ && typeof globalThis.__ECF_TRACER__.getContext === 'function') {
        const ctx = globalThis.__ECF_TRACER__.getContext();
        if (ctx) {
          return {
            traceId: ctx.traceId ?? null,
            spanId: ctx.spanId ?? ctx.parentSpanId ?? null,
            correlationId: ctx.correlationId ?? ctx.traceId ?? null,
          };
        }
      }
    } catch {
      // Ignore if observability is not loaded
    }
    return null;
  }
}

export default LogContext;
