import nodeTest from 'node:test';
import { TestApplication } from './TestApplication.js';
import { TimeTravel } from './TimeTravel.js';
import { ModelFactory, factory } from './ModelFactory.js';
import { BrowserAgent } from './browser/BrowserAgent.js';
import { BenchmarkEngine } from './BenchmarkEngine.js';
import { SnapshotTesting } from './SnapshotTesting.js';

/**
 * Dependency Injected Test Context Runner.
 */
export function test(title, fn) {
  return nodeTest(title, async (t) => {
    const app = new TestApplication();
    const http = app.http;
    const database = app.database;
    const fake = app.fakes;
    const time = TimeTravel;
    const browser = new BrowserAgent();
    const benchmark = BenchmarkEngine.run;
    const snapshot = new SnapshotTesting();
    const factoryHelper = (model) => new ModelFactory(model, database);

    try {
      await fn({
        t,
        app,
        http,
        database,
        fake,
        time,
        browser,
        benchmark,
        snapshot,
        factory: factoryHelper,
      });
    } finally {
      TimeTravel.restore();
      app.flush();
    }
  });
}

test.profile = function (profileName) {
  return {
    test: (title, fn) => {
      const activeProfile = process.env.TEST_PROFILE || null;
      if (activeProfile && activeProfile !== profileName) {
        return nodeTest.skip(`[Profile: ${profileName}] ${title}`, fn);
      }
      return test(`[Profile: ${profileName}] ${title}`, fn);
    },
  };
};

export const it = test;
export const describe = nodeTest.describe;
export const beforeEach = nodeTest.beforeEach;
export const afterEach = nodeTest.afterEach;

export default test;
