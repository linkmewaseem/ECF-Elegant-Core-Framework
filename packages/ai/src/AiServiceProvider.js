import { AiManager } from './AiManager.js';

export class AiServiceProvider {
  constructor(app) {
    this.app = app;
  }

  register() {
    this.app.singleton('ai', (container) => {
      const config = container.has('config') ? container.make('config').get('ai') || {} : {};
      return new AiManager(config);
    });

    this.app.alias('ai', AiManager);
  }

  boot() {
    // Boot hooks
  }
}

export default AiServiceProvider;
