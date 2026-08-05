import { ServiceProvider } from '@ecfjs/core';

export class RequestRecord {
  id: string;
  traceId: string;
  method: string;
  url: string;
  ip: string;
  startedAt: number;
  endedAt: number | null;
  durationMs: number;
  status: number;
  panels: Record<string, any>;
  timeline: any[];
  tags: Record<string, any>;

  constructor(options?: {
    id?: string;
    traceId?: string | null;
    method?: string;
    url?: string;
    ip?: string;
    startedAt?: number;
  });

  addQuery(queryData: any): void;
  addCacheOp(opType: string, data: any): void;
  addJob(status: string, jobData: any): void;
  addMail(status: string, mailData: any): void;
  addNotification(notificationData: any): void;
  addEvent(eventData: any): void;
  addStorageOp(opData: any): void;
  addUpload(fileData: any): void;
  addMedia(mediaData: any): void;
  addException(error: Error): void;
  addTimelineEntry(entry: any): void;
  seal(options?: { status?: number; memoryBefore?: any; memoryAfter?: any }): this;
  toObject(): Record<string, any>;
}

export class EntryStore {
  constructor(options?: { capacity?: number });
  add(record: RequestRecord): this;
  all(): any[];
  get(id: string): any | null;
  find(options?: { search?: string | null; status?: string | number | null; method?: string | null; panel?: string | null; limit?: number }): any[];
  clear(): this;
  stats(): { totalRequests: number; avgDurationMs: number; totalQueries: number; slowQueries: number; totalErrors: number };
  readonly capacity: number;
  readonly count: number;
}

export class DevToolsManager {
  constructor(options?: { port?: number; maxEntries?: number });
  startServer(port?: number): Promise<string>;
  stopServer(): Promise<void>;
  getUrl(): string;
  record(requestRecord: RequestRecord): this;
  getEntries(): any[];
  getEntry(id: string): any | null;
  clear(): this;
  readonly store: EntryStore;
  readonly server: any;
  readonly collectors: Record<string, any>;
}

export class HttpCollector {
  collect(requestRecord: RequestRecord, req: any, res: any): void;
}
export class DatabaseCollector {
  collectQuery(requestRecord: RequestRecord, queryData: any): void;
}
export class CacheCollector {
  collectHit(requestRecord: RequestRecord, key: string, driver?: string): void;
  collectMiss(requestRecord: RequestRecord, key: string, driver?: string): void;
  collectWrite(requestRecord: RequestRecord, key: string, value: any, ttl?: number | null, driver?: string): void;
  collectDelete(requestRecord: RequestRecord, key: string, driver?: string): void;
}
export class QueueCollector {
  collectJobDispatched(requestRecord: RequestRecord, jobName: string, queue?: string, payload?: any): void;
  collectJobProcessed(requestRecord: RequestRecord, jobName: string, durationMs: number, queue?: string): void;
  collectJobFailed(requestRecord: RequestRecord, jobName: string, error: Error, queue?: string): void;
}
export class MailCollector {
  collectSent(requestRecord: RequestRecord, mailable: any, durationMs?: number): void;
  collectFailed(requestRecord: RequestRecord, mailable: any, error: Error): void;
}
export class NotificationCollector {
  collectSent(requestRecord: RequestRecord, notificationName: string, channel: string, recipient: any, durationMs?: number): void;
}
export class EventCollector {
  collectDispatched(requestRecord: RequestRecord, eventName: string, payloadPreview?: any, listenersCount?: number): void;
}
export class StorageCollector {
  collectOperation(requestRecord: RequestRecord, operation: string, path: string, disk?: string, durationMs?: number): void;
}
export class UploadCollector {
  collectUpload(requestRecord: RequestRecord, fileInfo: any): void;
}
export class MediaCollector {
  collectProcessed(requestRecord: RequestRecord, resultData: any): void;
}
export class ExceptionCollector {
  collect(requestRecord: RequestRecord, error: Error): void;
}
export class PerformanceCollector {
  captureMemory(): NodeJS.MemoryUsage;
}

export class DevToolsMiddleware {
  constructor(store: EntryStore);
  handle(req: any, res: any, next?: Function): any;
}

export class DevToolsRouter {
  constructor(store: EntryStore);
  handle(req: any, res: any): void;
}

export class DevToolsServer {
  constructor(store: EntryStore, options?: { port?: number; host?: string });
  start(port?: number, host?: string): Promise<string>;
  stop(): Promise<void>;
  getUrl(): string;
  isListening(): boolean;
}

export class DevToolsServiceProvider extends ServiceProvider {
  register(app: any): void;
  boot(app: any): Promise<void>;
}

export const DevToolsFacade: any;
export const DevTools: any;

export class DevToolsFake {
  constructor();
  record(record: RequestRecord): this;
  assertRecorded(urlOrPredicate: string | Function): void;
  assertNotRecorded(urlOrPredicate: string | Function): void;
  assertCount(expectedCount: number): void;
  clear(): this;
  readonly store: EntryStore;
}
