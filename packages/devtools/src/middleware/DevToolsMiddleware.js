import { Tracer, TraceContext } from '@ecfjs/observability';
import { RequestRecord } from '../core/RequestRecord.js';
import { PerformanceCollector } from '../collectors/PerformanceCollector.js';
import { HttpCollector } from '../collectors/HttpCollector.js';

export class DevToolsMiddleware {
  #store;
  #perfCollector;
  #httpCollector;

  constructor(store) {
    this.#store = store;
    this.#perfCollector = new PerformanceCollector();
    this.#httpCollector = new HttpCollector();
  }

  handle(req, res, next) {
    if (!this.#store) return next ? next() : undefined;

    const url = req.url ?? req.raw?.url ?? '/';
    // Skip internal DevTools telemetry/polling requests
    if (url.startsWith('/api/entries') || url.startsWith('/api/stats') || url.startsWith('/api/clear') || url === '/api/health') {
      return typeof next === 'function' ? next() : undefined;
    }

    const memoryBefore = this.#perfCollector.captureMemory();
    const traceCtx = Tracer.getContext() ?? new TraceContext({ requestId: req.id, traceId: req.traceId });

    const record = new RequestRecord({
      id: traceCtx.requestId,
      traceId: traceCtx.traceId,
      method: req.method ?? req.raw?.method ?? 'GET',
      url,
      ip: req.ip ?? req.socket?.remoteAddress ?? '127.0.0.1',
    });

    this.#httpCollector.collect(record, req, res);

    record.addTimelineEntry({
      event: 'HTTP Request Received',
      category: 'http',
      at: 0,
      status: 'INFO',
      data: { method: record.method, url: record.url, ip: record.ip }
    });

    traceCtx.devToolsRecord = record;
    req.devToolsRecord = record;

    const targetRes = res?.raw || res;
    let finished = false;

    const finishHandler = () => {
      if (finished) return;
      finished = true;

      if (typeof targetRes?.removeListener === 'function') {
        targetRes.removeListener('finish', finishHandler);
        targetRes.removeListener('close', finishHandler);
      }

      this.#httpCollector.collect(record, req, res);

      const memoryAfter = this.#perfCollector.captureMemory();
      const status = res.statusCode ?? targetRes?.statusCode ?? 200;

      record.addTimelineEntry({
        event: 'HTTP Response Completed',
        category: 'http',
        at: Date.now() - record.startedAt,
        status: status < 400 ? 'SUCCESS' : 'ERROR',
        data: { status, durationMs: Date.now() - record.startedAt }
      });

      record.seal({
        status,
        memoryBefore,
        memoryAfter,
      });

      this.#store.add(record);
    };

    if (typeof targetRes?.on === 'function') {
      targetRes.on('finish', finishHandler);
      targetRes.on('close', finishHandler);
    } else {
      process.nextTick(finishHandler);
    }

    if (typeof next === 'function') {
      return Tracer.runWithContext(traceCtx, next);
    }
  }
}

export default DevToolsMiddleware;
