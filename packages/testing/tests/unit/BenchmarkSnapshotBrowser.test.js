import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { test, BenchmarkEngine, SnapshotTesting, BrowserAgent } from '../../src/index.js';

describe('BenchmarkEngine, SnapshotTesting & BrowserAgent Unit Tests', () => {
  test('should execute benchmark and return performance metrics', async ({ benchmark }) => {
    const res = await benchmark('Array Processing Benchmark', async () => {
      const arr = Array.from({ length: 100 }, (_, i) => i * 2);
      return arr.reduce((acc, n) => acc + n, 0);
    }, { iterations: 500, warmup: 5 });

    assert.ok(res.opsPerSec > 0);
    assert.ok(res.avgLatencyMicroSec >= 0);
    res.expectOps(100);
  });

  test('should assert contract implementation with Contract.assertImplemented', async () => {
    const { Contract } = await import('../../src/index.js');
    class DummyDriver {
      async write() {}
      getCapabilities() { return {}; }
    }
    const { ILogDriver } = await import('@ecfjs/contracts');
    assert.ok(Contract.assertImplemented(new DummyDriver(), ILogDriver));
  });

  test('should perform snapshot testing and write files to __snapshots__', async ({ snapshot }) => {

    const snapDir = path.resolve('./storage/test_snapshots');
    const snapshotEngine = new SnapshotTesting({ snapshotDir: snapDir });

    const payload = { id: 101, title: 'ECF Snapshot Test', active: true };
    snapshotEngine.assertJsonSnapshot(payload, 'test_payload');

    const snapFile = path.join(snapDir, 'test_payload.json.snap');
    assert.ok(fs.existsSync(snapFile));

    // Cleanup
    if (fs.existsSync(snapDir)) {
      fs.rmSync(snapDir, { recursive: true, force: true });
    }
  });

  test('should execute BrowserAgent interactions and assertions', async ({ browser }) => {
    await browser.visit('/checkout');
    await browser.type('#email', 'customer@example.com');
    await browser.click('#buy');

    browser.assertSee('ECF App');
    browser.assertSee('customer@example.com');
    browser.assertDontSee('Fatal Error');
    browser.assertPath('/checkout');
  });
});
