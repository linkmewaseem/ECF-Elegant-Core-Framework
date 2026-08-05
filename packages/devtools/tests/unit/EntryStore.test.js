import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { EntryStore, RequestRecord } from '../../src/index.js';

describe('@ecfjs/devtools — EntryStore Unit Tests', () => {
  test('EntryStore capacity bounding and FIFO eviction', () => {
    const store = new EntryStore({ capacity: 3 });
    const r1 = new RequestRecord({ url: '/r1' }).seal();
    const r2 = new RequestRecord({ url: '/r2' }).seal();
    const r3 = new RequestRecord({ url: '/r3' }).seal();
    const r4 = new RequestRecord({ url: '/r4' }).seal();

    store.add(r1).add(r2).add(r3).add(r4);

    assert.equal(store.count, 3);
    const all = store.all();
    assert.equal(all[0].url, '/r4'); // newest first
    assert.equal(all[2].url, '/r2');
  });

  test('EntryStore search and status filtering', () => {
    const store = new EntryStore({ capacity: 10 });
    const r1 = new RequestRecord({ url: '/api/users', method: 'GET' }).seal({ status: 200 });
    const r2 = new RequestRecord({ url: '/api/orders', method: 'POST' }).seal({ status: 201 });
    const r3 = new RequestRecord({ url: '/api/failing', method: 'GET' }).seal({ status: 500 });

    store.add(r1).add(r2).add(r3);

    assert.equal(store.find({ search: 'orders' }).length, 1);
    assert.equal(store.find({ status: 500 }).length, 1);
    assert.equal(store.find({ method: 'GET' }).length, 2);
  });

  test('EntryStore statistics aggregation', () => {
    const store = new EntryStore();
    const r1 = new RequestRecord({ url: '/r1' });
    r1.addQuery({ sql: 'SELECT 1', durationMs: 150 });
    r1.seal({ status: 200 });
    store.add(r1);

    const stats = store.stats();
    assert.equal(stats.totalRequests, 1);
    assert.equal(stats.totalQueries, 1);
    assert.equal(stats.slowQueries, 1);
  });
});
