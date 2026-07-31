import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HttpEventBus, HttpEvents } from '../../src/index.js';

test('Stage 1 - HttpEventBus dispatches HTTP lifecycle events', async () => {
  const eventBus = new HttpEventBus();
  const logs = [];

  eventBus.on(HttpEvents.REQUEST_RECEIVED, (data) => {
    logs.push(`received:${data.url}`);
  });

  eventBus.on(HttpEvents.ROUTE_MATCHED, (data) => {
    logs.push(`matched:${data.route}`);
  });

  await eventBus.emit(HttpEvents.REQUEST_RECEIVED, { url: '/api/v1/health' });
  await eventBus.emit(HttpEvents.ROUTE_MATCHED, { route: '/api/v1/health' });

  assert.deepEqual(logs, ['received:/api/v1/health', 'matched:/api/v1/health']);
});
