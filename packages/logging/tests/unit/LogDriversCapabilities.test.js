import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  MemoryDriver,
  NullDriver,
  FileDriver,
  DailyDriver,
  StackDriver,
  ConsoleDriver,
  SlackDriver,
  DiscordDriver,
  WebhookDriver,
  MailDriver,
  ElasticDriver,
  LokiDriver,
} from '../../src/index.js';

describe('Log Drivers & Capability Matrix Unit Tests', () => {
  it('should expose capability matrices across all drivers', () => {
    const memory = new MemoryDriver();
    const nullDriver = new NullDriver();
    const daily = new DailyDriver({ compress: true });
    const stack = new StackDriver({ channels: [memory] });
    const slack = new SlackDriver({ url: 'http://localhost/mock' });
    const elastic = new ElasticDriver({ endpoint: 'http://localhost:9200' });
    const loki = new LokiDriver({ endpoint: 'http://localhost:3100' });

    assert.strictEqual(memory.getCapabilities().supportsBatch, true);
    assert.strictEqual(nullDriver.getCapabilities().supportsJson, true);
    assert.strictEqual(daily.getCapabilities().supportsRotation, true);
    assert.strictEqual(daily.getCapabilities().supportsCompression, true);
    assert.strictEqual(slack.getCapabilities().supportsRetry, true);
    assert.strictEqual(elastic.getCapabilities().supportsBatch, true);
    assert.strictEqual(loki.getCapabilities().supportsRetry, true);
  });
});
