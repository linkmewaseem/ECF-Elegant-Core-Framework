import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { MemoryExporter, RingBuffer, NullExporter, ConsoleExporter } from '../src/index.js';

describe('@ecf/observability — Exporters & RingBuffer Tests', () => {
  test('RingBuffer capacity rollover', () => {
    const buf = new RingBuffer(3);
    buf.push(1).push(2).push(3).push(4);

    assert.equal(buf.size, 3);
    assert.deepEqual(buf.toArray(), [2, 3, 4]);
    assert.deepEqual(buf.last(2), [3, 4]);
  });

  test('MemoryExporter storage and clearing', () => {
    const memory = new MemoryExporter({ capacity: 5 });
    memory.exportMetric({ name: 'm1', value: 10 });
    memory.exportTimelineEntry({ event: 'ev1' });

    assert.equal(memory.getMetrics().length, 1);
    assert.equal(memory.getTimeline().length, 1);

    memory.clear();
    assert.equal(memory.getMetrics().length, 0);
    assert.equal(memory.getTimeline().length, 0);
  });

  test('NullExporter and ConsoleExporter execution safety', () => {
    const nullExp = new NullExporter();
    assert.doesNotThrow(() => {
      nullExp.exportSpan({});
      nullExp.exportMetric({});
      nullExp.exportTimelineEntry({});
      nullExp.flush();
    });

    const consoleExp = new ConsoleExporter();
    assert.doesNotThrow(() => {
      consoleExp.exportMetric({ name: 'test', type: 'counter', value: 1 });
      consoleExp.exportTimelineEntry({ event: 'test', category: 'general', at: 10 });
      consoleExp.flush();
    });
  });
});
