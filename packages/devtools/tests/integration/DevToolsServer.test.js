import { describe, test, after } from 'node:test';
import assert from 'node:assert/strict';
import { EntryStore, DevToolsServer, RequestRecord } from '../../src/index.js';

describe('@ecf/devtools — DevToolsServer Integration Tests', () => {
  let server;
  let store;

  after(async () => {
    if (server) await server.stop();
  });

  test('Server starts, serves HTTP dashboard HTML and REST endpoints', async () => {
    store = new EntryStore();
    const record = new RequestRecord({ url: '/api/v1/health' });
    record.addQuery({ sql: 'SELECT 1', durationMs: 10 });
    record.seal({ status: 200 });
    store.add(record);

    server = new DevToolsServer(store, { port: 8788 });
    const url = await server.start();
    assert.equal(url, 'http://127.0.0.1:8788');

    // Test GET /dashboard HTML
    const htmlRes = await fetch(`${url}/`);
    assert.equal(htmlRes.status, 200);
    const htmlText = await htmlRes.text();
    assert.ok(htmlText.includes('ECF DevTools'));

    // Test GET /api/entries JSON
    const entriesRes = await fetch(`${url}/api/entries`);
    assert.equal(entriesRes.status, 200);
    const entriesData = await entriesRes.json();
    assert.equal(entriesData.length, 1);
    assert.equal(entriesData[0].url, '/api/v1/health');

    // Test GET /api/entries/:id
    const entryRes = await fetch(`${url}/api/entries/${record.id}`);
    assert.equal(entryRes.status, 200);
    const entryData = await entryRes.json();
    assert.equal(entryData.id, record.id);

    // Test GET /api/stats
    const statsRes = await fetch(`${url}/api/stats`);
    assert.equal(statsRes.status, 200);
    const statsData = await statsRes.json();
    assert.equal(statsData.totalRequests, 1);

    // Test POST /api/clear
    const clearRes = await fetch(`${url}/api/clear`, { method: 'POST' });
    assert.equal(clearRes.status, 200);
    assert.equal(store.count, 0);

    await server.stop();
  });
});
