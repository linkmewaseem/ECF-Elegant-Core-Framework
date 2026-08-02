import { describe, it } from 'node:test';
import assert from 'node:assert';
import { test, TestApplication } from '../../src/index.js';

describe('TestRunner & TestApplication Unit Tests', () => {
  it('should instantiate TestApplication sandbox in testing environment mode', () => {
    const app = new TestApplication();
    assert.strictEqual(app.env, 'testing');
    assert.ok(app.http);
    assert.ok(app.database);
    assert.ok(app.fakes);
  });

  test('should inject DI TestContext into test callback', async ({ app, http, database, time, fake, factory, browser, benchmark, snapshot }) => {
    assert.ok(app);
    assert.ok(http);
    assert.ok(database);
    assert.ok(time);
    assert.ok(fake);
    assert.ok(factory);
    assert.ok(browser);
    assert.ok(benchmark);
    assert.ok(snapshot);
  });

  it('should support test.profile filtering', () => {
    const profiled = test.profile('fast');
    assert.ok(typeof profiled.test === 'function');
  });
});
