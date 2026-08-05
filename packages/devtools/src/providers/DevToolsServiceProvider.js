import { ServiceProvider } from '@ecfjs/core';
import { DevToolsManager } from '../core/DevToolsManager.js';

export class DevToolsServiceProvider extends ServiceProvider {
  register(app) {
    app.singleton('devtools', (app) => {
      const config = app.has('config') ? app.make('config') : null;
      const port = config?.get('devtools.port', 8787) ?? 8787;
      const maxEntries = config?.get('devtools.maxEntries', 200) ?? 200;

      return new DevToolsManager({ port, maxEntries });
    });
  }

  async boot(app) {
    const config = app.has('config') ? app.make('config') : null;
    const enabled = config?.get('devtools.enabled', false) ?? false;

    if (enabled && app.has('devtools')) {
      const manager = app.make('devtools');
      try {
        await manager.startServer();
      } catch {
        // DevTools server boot is non-blocking to prevent app crash if port is in use
      }
    }
  }
}

export default DevToolsServiceProvider;
