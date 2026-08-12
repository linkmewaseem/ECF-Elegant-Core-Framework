import { Tracer, TraceContext } from '@ecfjs/observability';
import { RequestRecord } from '../core/RequestRecord.js';
import { PerformanceCollector } from '../collectors/PerformanceCollector.js';

export class DevToolsMiddleware {
  #store;
  #perfCollector;

  constructor(store) {
    this.#store = store;
    this.#perfCollector = new PerformanceCollector();
  }

  handle(req, res, next) {
    if (!this.#store) return next ? next() : undefined;

    const memoryBefore = this.#perfCollector.captureMemory();
    const traceCtx = Tracer.getContext() ?? new TraceContext({ requestId: req.id, traceId: req.traceId });

    const record = new RequestRecord({
      id: traceCtx.requestId,
      traceId: traceCtx.traceId,
      method: req.method ?? req.raw?.method ?? 'GET',
      url: req.url ?? req.raw?.url ?? '/',
      ip: req.ip ?? req.socket?.remoteAddress ?? '127.0.0.1',
    });

    req.devToolsRecord = record;

    const targetRes = res?.raw || res;

    const finishHandler = () => {
      if (typeof targetRes?.removeListener === 'function') {
        targetRes.removeListener('finish', finishHandler);
        targetRes.removeListener('close', finishHandler);
      }

      const memoryAfter = this.#perfCollector.captureMemory();
      record.seal({
        status: res.statusCode ?? targetRes?.statusCode ?? 200,
        memoryBefore,
        memoryAfter,
      });

      this.#store.add(record);
    };

    if (typeof targetRes?.on === 'function') {
      targetRes.on('finish', finishHandler);
      targetRes.on('close', finishHandler);
    }

    if (typeof next === 'function') {
      return Tracer.runWithContext(traceCtx, next);
    }
  }
}

export default DevToolsMiddleware;
