import { TestApplication } from './TestApplication.js';

export class TestingServiceProvider {
  constructor(app) {
    this.app = app;
  }

  register() {
    this.app.singleton('testing', (container) => {
      return new TestApplication({ container });
    });
  }

  boot() {
    // Optional boot
  }
}

export default TestingServiceProvider;
