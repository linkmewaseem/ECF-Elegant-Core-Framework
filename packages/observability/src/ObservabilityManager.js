import { Tracer } from './core/Tracer.js';
import { MetricsCollector } from './core/MetricsCollector.js';
import { Timeline } from './core/Timeline.js';
import { MemoryExporter } from './exporters/Exporters.js';
import {
  DatabaseHook,
  CacheHook,
  QueueHook,
  MailHook,
  NotificationHook,
  UploadHook,
  StorageHook,
  MediaHook,
  AuthHook,
  HttpHook,
} from './hooks/DomainHooks.js';

/**
 * ObservabilityManager — Core manager orchestrating tracing, metrics, timelines, and domain hooks.
 */
export class ObservabilityManager {
  #metrics;
  #timeline;
  #hooks = new Map();

  constructor({ defaultExporter = true, exporterCapacity = 500 } = {}) {
    this.#metrics = new MetricsCollector();
    this.#timeline = new Timeline();

    if (defaultExporter) {
      this.addExporter(new MemoryExporter({ capacity: exporterCapacity }));
    }

    this.#initializeHooks();
  }

  #initializeHooks() {
    this.#hooks.set('db', new DatabaseHook({ metrics: this.#metrics, timeline: this.#timeline }));
    this.#hooks.set('cache', new CacheHook({ metrics: this.#metrics, timeline: this.#timeline }));
    this.#hooks.set('queue', new QueueHook({ metrics: this.#metrics, timeline: this.#timeline }));
    this.#hooks.set('mail', new MailHook({ metrics: this.#metrics, timeline: this.#timeline }));
    this.#hooks.set('notifications', new NotificationHook({ metrics: this.#metrics, timeline: this.#timeline }));
    this.#hooks.set('upload', new UploadHook({ metrics: this.#metrics, timeline: this.#timeline }));
    this.#hooks.set('storage', new StorageHook({ metrics: this.#metrics, timeline: this.#timeline }));
    this.#hooks.set('media', new MediaHook({ metrics: this.#metrics, timeline: this.#timeline }));
    this.#hooks.set('auth', new AuthHook({ metrics: this.#metrics, timeline: this.#timeline }));
    this.#hooks.set('http', new HttpHook({ metrics: this.#metrics, timeline: this.#timeline }));
  }

  // ─── Exporter Management ──────────────────────────────────────────────────

  addExporter(exporter) {
    Tracer.addExporter(exporter);
    this.#syncExporters();
    return this;
  }

  removeExporter(name) {
    Tracer.removeExporter(name);
    this.#syncExporters();
    return this;
  }

  clearExporters() {
    Tracer.clearExporters();
    this.#syncExporters();
    return this;
  }

  getExporters() {
    return Tracer.getExporters();
  }

  #syncExporters() {
    const exporters = Tracer.getExporters();
    this.#metrics.linkExporters(exporters);
    this.#timeline.linkExporters(exporters);
  }

  // ─── Subsystem Getters ───────────────────────────────────────────────────

  get metrics() {
    return this.#metrics;
  }

  get timeline() {
    return this.#timeline;
  }

  get tracer() {
    return Tracer;
  }

  /** Retrieve specific domain hook helper */
  getHook(name) {
    return this.#hooks.get(name) ?? null;
  }

  get hooks() {
    return this.#hooks;
  }

  // ─── Direct Tracing Shortcuts ─────────────────────────────────────────────

  startSpan(name, attributes = {}) {
    return Tracer.startSpan(name, attributes);
  }

  finishSpan(span, finalAttributes = {}) {
    Tracer.finishSpan(span, finalAttributes);
  }

  trace(name, attributes, fn) {
    return Tracer.trace(name, attributes, fn);
  }

  traceSync(name, attributes, fn) {
    return Tracer.traceSync(name, attributes, fn);
  }
}

export default ObservabilityManager;
