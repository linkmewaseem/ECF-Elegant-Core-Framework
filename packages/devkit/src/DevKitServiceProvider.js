import { DevKitManager } from './DevKitManager.js';

export class DevKitServiceProvider {
  constructor(app) {
    this.app = app;
  }

  register() {
    this.app.singleton('devkit', (container) => {
      const config = container.has('config') ? container.make('config').get('devkit') || {} : {};
      return new DevKitManager(config);
    });

    this.app.alias('devkit', DevKitManager);
  }

  boot() {
    // Boot hooks
  }
}

export default DevKitServiceProvider;
