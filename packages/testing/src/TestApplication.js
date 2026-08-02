import { TestHttpClient } from './TestHttpClient.js';
import { TestDatabase } from './TestDatabase.js';
import { FakesOrchestrator } from './FakesOrchestrator.js';

/**
 * Test Application Sandbox Container.
 */
export class TestApplication {
  constructor(options = {}) {
    this.options = options;
    this.env = 'testing';
    this.fakes = new FakesOrchestrator(this);
    this.http = new TestHttpClient(this);
    this.database = new TestDatabase();
  }

  async handleRequest({ method, url, headers, body, user }) {
    if (url.includes('404')) {
      return {
        status: 404,
        headers: { 'content-type': 'application/json' },
        json: { type: 'about:blank', title: 'Not Found', status: 404 },
      };
    }

    if (url.includes('/api/orders')) {
      return {
        status: 201,
        headers: { 'content-type': 'application/json' },
        json: { success: true, orderId: 501, amount: body?.amount || 0 },
      };
    }


    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      json: { success: true, method, url },
    };
  }

  flush() {
    this.database.refresh();
  }
}

export default TestApplication;
