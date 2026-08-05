import { ServiceProvider } from '@ecfjs/core';

export abstract class IExporter {
  exportSpan(span: ISpan | object): void;
  exportMetric(metric: object): void;
  exportTimelineEntry(entry: object): void;
  flush(): void;
  name(): string;
}

export abstract class ISpan {
  finish(attributes?: Record<string, any>): this;
  addAttribute(key: string, value: any): this;
  addEvent(name: string, attributes?: Record<string, any>): this;
  setStatus(status: string): this;
  isFinished(): boolean;
  toObject(): Record<string, any>;
}

export const SlowThreshold: {
  WARN: number;
  SLOW: number;
  CRITICAL: number;
};

export class Span extends ISpan {
  constructor(options?: {
    name?: string;
    category?: string;
    traceId?: string | null;
    parentSpanId?: string | null;
    attributes?: Record<string, any>;
  });

  finish(attributes?: Record<string, any>): this;
  addAttribute(key: string, value: any): this;
  addEvent(name: string, attributes?: Record<string, any>): this;
  setStatus(status: string): this;
  recordError(error: Error): this;
  isFinished(): boolean;
  isSlowOrWorse(): boolean;
  getSpanId(): string;
  getTraceId(): string;
  getParentSpanId(): string | null;
  getName(): string;
  getCategory(): string;
  getDurationMs(): number | null;
  getStatus(): string;
  getAttributes(): Record<string, any>;
  toObject(): Record<string, any>;
}

export class TraceContext {
  requestId: string;
  traceId: string;
  parentSpanId: string | null;
  userId: string | null;
  tenantId: string | null;
  tags: Record<string, any>;
  startedAt: number;

  constructor(options?: {
    requestId?: string;
    traceId?: string;
    parentSpanId?: string | null;
    userId?: string | null;
    tenantId?: string | null;
    tags?: Record<string, any>;
    startedAt?: number;
  });

  withParentSpan(spanId: string): TraceContext;
  withUser(userId: string): this;
  withTenant(tenantId: string): this;
  tag(key: string, value: any): this;
  toObject(): Record<string, any>;
}

export class Tracer {
  static addExporter(exporter: IExporter): typeof Tracer;
  static removeExporter(name: string): typeof Tracer;
  static clearExporters(): typeof Tracer;
  static getExporters(): IExporter[];
  static enable(): void;
  static disable(): void;
  static isEnabled(): boolean;
  static getContext(): TraceContext | null;
  static runWithContext<T>(ctx: TraceContext, fn: () => T): T;
  static runWithNewContext<T>(fn: () => T, contextOptions?: Record<string, any>): T;
  static startSpan(name: string, attributes?: Record<string, any>): Span;
  static finishSpan(span: Span, finalAttributes?: Record<string, any>): void;
  static trace<T>(name: string, attributes: Record<string, any>, fn: (span: Span) => Promise<T>): Promise<T>;
  static traceSync<T>(name: string, attributes: Record<string, any>, fn: (span: Span) => T): T;
}

export class MetricsCollector {
  linkExporters(exporters: IExporter[]): this;
  increment(name: string, value?: number, tags?: Record<string, any>): this;
  decrement(name: string, value?: number, tags?: Record<string, any>): this;
  getCounter(name: string): number;
  gauge(name: string, value: number, tags?: Record<string, any>): this;
  getGauge(name: string): number | null;
  histogram(name: string, value: number, tags?: Record<string, any>): this;
  getHistogram(name: string): {
    values: number[];
    sum: number;
    count: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } | null;
  getAll(): { counters: Record<string, number>; gauges: Record<string, any>; histograms: Record<string, any> };
  reset(): this;
}

export class Timeline {
  linkExporters(exporters: IExporter[]): this;
  record(event: string, data?: Record<string, any>, category?: string): Record<string, any>;
}

export class MemoryExporter extends IExporter {
  constructor(options?: { capacity?: number });
  getSpans(): any[];
  getMetrics(): any[];
  getTimeline(): any[];
  clear(): void;
}

export class ConsoleExporter extends IExporter {}
export class NullExporter extends IExporter {}

export class RingBuffer<T = any> {
  constructor(capacity?: number);
  push(item: T): this;
  toArray(): T[];
  last(count: number): T[];
  clear(): this;
  readonly size: number;
  readonly capacity: number;
  readonly isFull: boolean;
  readonly isEmpty: boolean;
}

export class BaseHook {
  constructor(options?: { metrics?: MetricsCollector | null; timeline?: Timeline | null });
  getMetrics(): MetricsCollector | null;
  getTimeline(): Timeline | null;
  recordMetric(type: string, name: string, value?: number, tags?: Record<string, any>): void;
  recordTimeline(event: string, data: Record<string, any>, category: string): void;
  startSpan(name: string, category: string, attributes?: Record<string, any>): Span;
  finishSpan(span: Span, finalAttributes?: Record<string, any>): void;
}

export class DatabaseHook extends BaseHook {
  onQueryExecuting(payload: { sql?: string; bindings?: any[]; connection?: string }): Span;
  onQueryExecuted(span: Span, payload: { durationMs?: number; connection?: string; sql?: string; rowsCount?: number }): void;
  onQueryFailed(span: Span, payload: { error?: Error; message?: string; sql?: string; connection?: string }): void;
}

export class CacheHook extends BaseHook {
  onHit(key: string, driver?: string): void;
  onMiss(key: string, driver?: string): void;
  onWritten(key: string, value: any, ttl?: number | null, driver?: string): void;
  onForgotten(key: string, driver?: string): void;
}

export class QueueHook extends BaseHook {
  onJobDispatched(jobName: string, queue?: string, payload?: Record<string, any>): void;
  onJobProcessing(jobName: string, queue?: string): Span;
  onJobProcessed(span: Span, jobName: string, durationMs: number, queue?: string): void;
  onJobFailed(span: Span, jobName: string, error: Error, queue?: string): void;
}

export class MailHook extends BaseHook {
  onMailSending(mailable: { to?: any; subject?: string }): Span;
  onMailSent(span: Span, mailable: { to?: any; subject?: string }, durationMs: number): void;
  onMailFailed(span: Span, mailable: { to?: any; subject?: string }, error: Error): void;
}

export class NotificationHook extends BaseHook {
  onNotificationSending(notification: any, channel: string): Span;
  onNotificationSent(span: Span, notification: any, channel: string, durationMs: number): void;
}

export class UploadHook extends BaseHook {
  onFileUploaded(fileInfo: { name?: string; mimeType?: string; size?: number; hash?: string }): void;
}

export class StorageHook extends BaseHook {
  onOperation(operation: string, path: string, disk: string, durationMs?: number): void;
}

export class MediaHook extends BaseHook {
  onMediaProcessing(mediaFile: any, driver?: string): Span;
  onMediaProcessed(span: Span, result: { originalName?: string; variants?: any; storedPath?: string }): void;
}

export class AuthHook extends BaseHook {
  onLogin(user: { id?: any; uuid?: any }, guard?: string): void;
  onFailedLogin(credentials: { email?: string }, guard?: string): void;
  onLogout(user?: { id?: any }, guard?: string): void;
}

export class HttpHook extends BaseHook {
  onRequestStarted(request: { method?: string; url?: string; ip?: string }): Span;
  onRequestFinished(span: Span, response: { statusCode?: number; status?: number }, durationMs: number): void;
}

export class ObservabilityManager {
  constructor(options?: { defaultExporter?: boolean; exporterCapacity?: number });
  addExporter(exporter: IExporter): this;
  removeExporter(name: string): this;
  clearExporters(): this;
  getExporters(): IExporter[];
  readonly metrics: MetricsCollector;
  readonly timeline: Timeline;
  readonly tracer: typeof Tracer;
  getHook(name: string): BaseHook | null;
  readonly hooks: Map<string, BaseHook>;
  startSpan(name: string, attributes?: Record<string, any>): Span;
  finishSpan(span: Span, finalAttributes?: Record<string, any>): void;
  trace<T>(name: string, attributes: Record<string, any>, fn: (span: Span) => Promise<T>): Promise<T>;
  traceSync<T>(name: string, attributes: Record<string, any>, fn: (span: Span) => T): T;
}

export const ObservabilityFacade: any;
export const Observability: any;

export class ObservabilityServiceProvider extends ServiceProvider {
  register(app: any): void;
  boot(app: any): void;
}
