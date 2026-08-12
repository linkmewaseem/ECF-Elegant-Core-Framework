import { ServiceProvider } from '@ecfjs/core';
import { AiManager } from './AiManager.js';

export class AiServiceProvider extends ServiceProvider {
  register(app = this.app) {
    const container = app || this.app;
    if (!container) return;
    container.singleton('ai', (c) => {
      const config = c.has('config') ? c.make('config').get('ai') || {} : {};
      return new AiManager(config);
    });

    if (typeof container.alias === 'function') {
      container.alias('ai', AiManager);
    }
  }

  boot() {
    // Boot hooks
  }
}

export default AiServiceProvider;
