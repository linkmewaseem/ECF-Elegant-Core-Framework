import { describe, it } from 'node:test';
import assert from 'node:assert';
import { LogManager, LogContext } from '../../src/index.js';

describe('OpenTelemetry Tracing & Search Integration Unit Tests', () => {
  it('should auto-propagate traceId and correlationId into log records', async () => {
    // Mock global trace context
    globalThis.__ECF_TRACER__ = {
      getContext: () => ({
        traceId: 'trace-abc-123',
        spanId: 'span-456',
        correlationId: 'corr-789',
      }),
    };

    const manager = new LogManager({ default: 'memory' });
    const memoryCh = manager.channel('memory');

    await manager.info('Request processed within span context');

    const records = memoryCh.driver.getRecords();
    assert.strictEqual(records.length, 1);
    assert.strictEqual(records[0].traceId, 'trace-abc-123');
    assert.strictEqual(records[0].context.correlationId, 'corr-789');

    // Cleanup mock
    delete globalThis.__ECF_TRACER__;
  });

  it('should support searching logs by query and trace ID', async () => {
    const manager = new LogManager({ default: 'memory' });
    const memoryCh = manager.channel('memory');

    await memoryCh.info('Order checkout created', { traceId: 'tr_1001', amount: 500 });
    await memoryCh.error('Database connection failed', { traceId: 'tr_1002' });

    const searchResults = await manager.search('checkout');
    assert.strictEqual(searchResults.length, 1);
    assert.strictEqual(searchResults[0].message, 'Order checkout created');

    const traceResults = await manager.searchTrace('tr_1002');
    assert.strictEqual(traceResults.length, 1);
    assert.strictEqual(traceResults[0].message, 'Database connection failed');
  });
});
