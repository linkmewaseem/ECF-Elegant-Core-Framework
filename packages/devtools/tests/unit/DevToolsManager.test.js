import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Application } from '@ecf/core';
import { DevToolsManager, DevToolsServiceProvider, RequestRecord } from '../../src/index.js';

describe('@ecf/devtools — DevToolsManager & ServiceProvider Tests', () => {
  test('DevToolsManager records and retrieves entries', () => {
    const manager = new DevToolsManager({ maxEntries: 50 });
    const record = new RequestRecord({ url: '/test' }).seal();

    manager.record(record);
    assert.equal(manager.getEntries().length, 1);
    assert.equal(manager.getEntry(record.id).url, '/test');

    manager.clear();
    assert.equal(manager.getEntries().length, 0);
  });

  test('DevToolsServiceProvider registers devtools in IoC container', async () => {
    const app = new Application();
    app.register(DevToolsServiceProvider);
    await app.boot();

    const devtools = app.make('devtools');
    assert.ok(devtools instanceof DevToolsManager);
  });
});
