import { ServiceProvider } from '@ecfjs/core';
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
    }
  }
}

export default DevToolsServiceProvider;

