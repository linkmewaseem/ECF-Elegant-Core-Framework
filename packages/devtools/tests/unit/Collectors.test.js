import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  RequestRecord,
  HttpCollector,
  DatabaseCollector,
  CacheCollector,
  QueueCollector,
  MailCollector,
  NotificationCollector,
  EventCollector,
  StorageCollector,
  UploadCollector,
  MediaCollector,
  ExceptionCollector,
} from '../../src/index.js';

describe('@ecfjs/devtools — Collectors Unit Tests', () => {
  test('HttpCollector captures method, url, status, headers', () => {
    const record = new RequestRecord({ method: 'POST', url: '/api/v1/orders' });
    const collector = new HttpCollector();
    collector.collect(record, { method: 'POST', url: '/api/v1/orders', headers: { 'user-agent': 'test' } }, { statusCode: 201 });

    const obj = record.toObject();
    assert.equal(obj.panels.http.method, 'POST');
    assert.equal(obj.panels.http.headers['user-agent'], 'test');
    assert.equal(obj.panels.http.status, 201);
  });

  test('DatabaseCollector detects slow and duplicate queries', () => {
    const record = new RequestRecord();
    const collector = new DatabaseCollector();

    collector.collectQuery(record, { sql: 'SELECT * FROM users', durationMs: 120, connection: 'mysql' });
    collector.collectQuery(record, { sql: 'SELECT * FROM users', durationMs: 20, connection: 'mysql' });

    const obj = record.toObject();
    assert.equal(obj.panels.db.totalQueries, 2);
    assert.equal(obj.panels.db.slowQueries, 1);
    assert.equal(obj.panels.db.duplicateQueries, 1);
  });

  test('CacheCollector tracks hits, misses, and operations', () => {
    const record = new RequestRecord();
    const collector = new CacheCollector();

    collector.collectHit(record, 'user:1');
    collector.collectMiss(record, 'user:2');
    collector.collectWrite(record, 'user:2', { name: 'John' }, 3600);

    const obj = record.toObject();
    assert.equal(obj.panels.cache.hits, 1);
    assert.equal(obj.panels.cache.misses, 1);
    assert.equal(obj.panels.cache.writes, 1);
    assert.equal(obj.panels.cache.operations.length, 3);
  });

  test('QueueCollector, MailCollector, and ExceptionCollector', () => {
    const record = new RequestRecord();
    new QueueCollector().collectJobDispatched(record, 'SendWelcomeEmail', 'default', { userId: 10 });
    new MailCollector().collectSent(record, { to: 'user@test.com', subject: 'Welcome' }, 50);
    new ExceptionCollector().collect(record, new Error('Unhandled exception'));

    const obj = record.toObject();
    assert.equal(obj.panels.queue.dispatched.length, 1);
    assert.equal(obj.panels.mail.sent.length, 1);
    assert.equal(obj.panels.exceptions.length, 1);
    assert.equal(obj.status, 500);
  });
});
