import { AsyncLocalStorage } from 'node:async_hooks';
import { Span } from './Span.js';
import { TraceContext } from './TraceContext.js';

/**
 * Tracer — creates and manages spans with AsyncLocalStorage context.
 *
 * API:
 *   const span = Tracer.startSpan("db.query", { category: "database", sql: "SELECT ..." });
 *   span.finish();
 *
 *   // Nested spans (parent automatically resolved from ALS context)
 *   const outer = Tracer.startSpan("http.request", { category: "http" });
 *     const inner = Tracer.startSpan("db.query", { category: "database" });
 *     inner.finish();
 *   outer.finish();
 *
 *   // Wrap a function in a span (auto-finishes on return or throw)
 *   const result = await Tracer.trace("cache.get", { category: "cache" }, async () => {
 *     return await cache.get("key");
 *   });
 *
 * Exporter pipeline:
 *   Tracer.addExporter(new MemoryExporter());
 *   Tracer.addExporter(new ConsoleExporter());
 *   // On span.finish() → all exporters receive span
 */
export class Tracer {
  static #als = new AsyncLocalStorage();
  static #exporters = [];
  static #enabled = true;

  // ─── Exporter Management ──────────────────────────────────────────────────

  static addExporter(exporter) {
    Tracer.#exporters.push(exporter);
    return Tracer;
  }

  static removeExporter(name) {
    Tracer.#exporters = Tracer.#exporters.filter((e) => e.name() !== name);
    return Tracer;
  }

  static clearExporters() {
    Tracer.#exporters = [];
    return Tracer;
  }

  static getExporters() { return [...Tracer.#exporters]; }

  static enable() { Tracer.#enabled = true; }
  static disable() { Tracer.#enabled = false; }
  static isEnabled() { return Tracer.#enabled; }

  // ─── Context Management ───────────────────────────────────────────────────

  /** Get the active TraceContext for the current async execution. */
  static getContext() {
    return Tracer.#als.getStore() ?? null;
  }

  /** Run a function within a new TraceContext scope. */
  static runWithContext(ctx, fn) {
    return Tracer.#als.run(ctx, fn);
  }

  /**
   * Run a function within a new request-scoped TraceContext.
   * Called by DevToolsMiddleware / HttpHook for each incoming request.
   */
  static runWithNewContext(fn, contextOptions = {}) {
    const ctx = new TraceContext(contextOptions);
    return Tracer.#als.run(ctx, fn);
  }

  // ─── Span Creation ────────────────────────────────────────────────────────

  /**
   * Start a new span. Automatically resolves parent from ALS context.
   * @param {string} name
   * @param {{ category?: string, [key: string]: any }} attributes
   * @returns {Span}
   */
  static startSpan(name, attributes = {}) {
    if (!Tracer.#enabled) return Tracer.#noopSpan(name);

    const ctx = Tracer.getContext();
    const { category = "general", ...rest } = attributes;

    const span = new Span({
      name,
      category,
      traceId: ctx?.traceId ?? null,
      parentSpanId: ctx?.parentSpanId ?? null,
      attributes: rest,
    });

    // Update context so nested spans know their parent
    if (ctx) ctx.parentSpanId = span.getSpanId();

    return span;
  }

  /**
   * Finish a span and push to all exporters.
   * @param {Span} span
   * @param {object} [finalAttributes]
   */
  static finishSpan(span, finalAttributes = {}) {
    if (!Tracer.#enabled || !span || typeof span.finish !== "function") return;
    span.finish(finalAttributes);

    // Restore parent span ID in context after this child finishes
    const ctx = Tracer.getContext();
    if (ctx && span.getParentSpanId()) {
      ctx.parentSpanId = span.getParentSpanId();
    } else if (ctx) {
      ctx.parentSpanId = null;
    }

    for (const exporter of Tracer.#exporters) {
      try { exporter.exportSpan(span); } catch { /* exporters must not crash the app */ }
    }
  }

  /**
   * Wrap an async (or sync) function in a span. Auto-finishes on completion.
   * @param {string} name
   * @param {object} attributes
   * @param {Function} fn
   */
  static async trace(name, attributes, fn) {
    const span = Tracer.startSpan(name, attributes);
    try {
      const result = await fn(span);
      Tracer.finishSpan(span);
      return result;
    } catch (err) {
      span.recordError(err);
      Tracer.finishSpan(span);
      throw err;
    }
  }

  /** Sync version of trace() for synchronous operations. */
  static traceSync(name, attributes, fn) {
    const span = Tracer.startSpan(name, attributes);
    try {
      const result = fn(span);
      Tracer.finishSpan(span);
      return result;
    } catch (err) {
      span.recordError(err);
      Tracer.finishSpan(span);
      throw err;
    }
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  /** Returns a no-op span object when tracing is disabled. */
  static #noopSpan(name) {
    return {
      name,
      finish: () => {},
      addAttribute: () => {},
      addEvent: () => {},
      setStatus: () => {},
      recordError: () => {},
      isFinished: () => true,
      isSlowOrWorse: () => false,
      toObject: () => ({ name, status: "ok", durationMs: 0 }),
    };
  }
}

export default Tracer;
