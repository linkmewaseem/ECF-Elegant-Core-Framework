import { ServiceProvider } from '@ecfjs/core';
import { Tracer } from '@ecfjs/observability';
import { DevToolsManager } from '../core/DevToolsManager.js';
import { RequestRecord } from '../core/RequestRecord.js';
import { DevToolsMiddleware } from '../middleware/DevToolsMiddleware.js';

export class DevToolsServiceProvider extends ServiceProvider {
  register(app) {
    app.singleton('devtools', (app) => {
      const config = app.has('config') ? app.make('config') : null;
      const port = config?.get('devtools.port', 8787) ?? parseInt(process.env.DEVTOOLS_PORT || '8787', 10);
      const maxEntries = config?.get('devtools.maxEntries', 200) ?? 200;

      return new DevToolsManager({ port, maxEntries });
    });
  }

  async boot(app) {
    const config = app.has('config') ? app.make('config') : null;
    const enabled = config?.get('devtools.enabled', true) ?? (process.env.DEVTOOLS_ENABLED !== 'false');

    if (enabled && app.has('devtools')) {
      const manager = app.make('devtools');
      try {
        await manager.startServer();
      } catch {
        // DevTools server boot is non-blocking to prevent app crash if port is in use
      }

      // Seed an initial system boot record if store is empty
      if (manager.store.count === 0) {
        const bootRecord = new RequestRecord({
          method: 'GET',
          url: '/system/app-boot',
          ip: '127.0.0.1',
        });
        bootRecord.addTimelineEntry({
          event: 'ECF Framework Bootstrapped',
          category: 'system',
          at: 0,
          status: 'SUCCESS',
          data: { status: 'DevTools Active', port: manager.server.port || 8787 }
        });
        bootRecord.seal({ status: 200 });
        manager.record(bootRecord);
      }

      // Auto-register HTTP kernel middleware if available
      if (app.has('http.kernel')) {
        try {
          const kernel = app.make('http.kernel');
          if (typeof kernel.use === 'function') {
            kernel.use(new DevToolsMiddleware(manager.store));
          }
        } catch {
          // Ignore if kernel cannot be resolved
        }
      }

      // Auto-register framework event listeners if event manager is available
      if (app.has('events')) {
        try {
          const events = app.make('events');

          const getActiveRecord = () => {
            const ctx = Tracer.getContext();
            return ctx?.devToolsRecord ?? (ctx?.requestId ? manager.store.get(ctx.requestId) : null) ?? manager.store.all()[0];
          };

          // QueryExecuted -> DB collector
          events.listen('QueryExecuted', (data) => {
            const record = getActiveRecord();
            if (record) manager.collectors.db.collectQuery(record, data);
          });

          // Cache events -> Cache collector
          events.listen('CacheHit', (data) => {
            const record = getActiveRecord();
            if (record) manager.collectors.cache.collectHit(record, data.key);
          });

          events.listen('CacheMissed', (data) => {
            const record = getActiveRecord();
            if (record) manager.collectors.cache.collectMiss(record, data.key);
          });

          events.listen('CacheWritten', (data) => {
            const record = getActiveRecord();
            if (record) manager.collectors.cache.collectWrite(record, data.key, data.value, data.ttlSeconds);
          });

          events.listen('CacheDeleted', (data) => {
            const record = getActiveRecord();
            if (record) manager.collectors.cache.collectDelete(record, data.key);
          });

          // Mail events -> Mail collector
          events.listen('MailSent', (data) => {
            const record = getActiveRecord();
            if (record) manager.collectors.mail.collectSent(record, data, data.durationMs);
          });

          events.listen('MailFailed', (data) => {
            const record = getActiveRecord();
            if (record) manager.collectors.mail.collectFailed(record, data, data.error);
          });

          // Queue events -> Queue collector
          events.listen('JobDispatched', (data) => {
            const record = getActiveRecord();
            if (record) manager.collectors.queue.collectJobDispatched(record, data.jobName, data.queue, data.payload);
          });

          events.listen('JobProcessed', (data) => {
            const record = getActiveRecord();
            if (record) manager.collectors.queue.collectJobProcessed(record, data.jobName, data.durationMs, data.queue);
          });

          events.listen('JobFailed', (data) => {
            const record = getActiveRecord();
            if (record) manager.collectors.queue.collectJobFailed(record, data.jobName, data.error, data.queue);
          });

          // Notification events -> Notification collector
          events.listen('NotificationSent', (data) => {
            const record = getActiveRecord();
            const collector = manager.collectors.notifications || manager.collectors.notification;
            if (record && collector) collector.collectSent(record, data.notificationName, data.channel, data.recipient, data.durationMs);
          });

          events.listen('NotificationFailed', (data) => {
            const record = getActiveRecord();
            const collector = manager.collectors.notifications || manager.collectors.notification;
            if (record && collector) collector.collectFailed(record, data.notificationName, data.channel, data.recipient, data.error);
          });
        } catch {
          // Ignore
        }
      }
    }
  }
}

export default DevToolsServiceProvider;
