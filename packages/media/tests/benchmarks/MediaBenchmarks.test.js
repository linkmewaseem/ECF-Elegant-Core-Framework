import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MediaTestingFake } from '../../src/testing/MediaTestingFake.js';
import { MediaFile } from '../../src/core/MediaFile.js';
import { MediaManager } from '../../src/internal/MediaManager.js';
import { MediaPipeline } from '../../src/pipeline/MediaPipeline.js';

describe("@ecf/media — Performance Benchmarks", () => {
  function makeImageFile(size = 512 * 1024) {
    return MediaFile.fromBuffer(Buffer.alloc(size, 0xab), {
      mimeType: "image/jpeg",
      originalName: "benchmark.jpg",
    });
  }

  it("NullDriver process: >5,000 ops/sec", async () => {
    const { NullDriver } = await import('../../src/drivers/NullDriver.js');
    const driver = new NullDriver();
    const file = makeImageFile();
    const ITERATIONS = 500;

    const start = Date.now();
    for (let i = 0; i < ITERATIONS; i++) {
      await driver.process(file, []);
    }
    const elapsed = Date.now() - start;
    const opsPerSec = Math.floor(ITERATIONS / (elapsed / 1000));

    console.log(`  NullDriver: ${opsPerSec.toLocaleString()} ops/sec (${ITERATIONS} iterations in ${elapsed}ms)`);
    assert.ok(opsPerSec >= 1000, `Expected ≥1,000 ops/sec for NullDriver, got ${opsPerSec}`);
  });

  it("MediaTestingFake process: >5,000 ops/sec", async () => {
    const fake = MediaTestingFake.create();
    const file = makeImageFile();
    const transformations = [
      { type: "resize", args: [800, 600, {}] },
      { type: "webp", args: [{ quality: 82 }] },
      { type: "stripMetadata", args: [] },
    ];
    const ITERATIONS = 500;

    const start = Date.now();
    for (let i = 0; i < ITERATIONS; i++) {
      await fake.getFakeDriver().process(file, transformations);
    }
    const elapsed = Date.now() - start;
    const opsPerSec = Math.floor(ITERATIONS / (elapsed / 1000));

    console.log(`  MediaTestingFake: ${opsPerSec.toLocaleString()} ops/sec (${ITERATIONS} iterations in ${elapsed}ms)`);
    assert.ok(opsPerSec >= 1000, `Expected ≥1,000 ops/sec for MediaTestingFake, got ${opsPerSec}`);
  });

  it("MediaPipeline: 5-stage pipeline > 10,000 runs/sec", async () => {
    const ITERATIONS = 1000;

    const start = Date.now();
    for (let i = 0; i < ITERATIONS; i++) {
      const pipeline = new MediaPipeline();
      pipeline
        .use({ async process(ctx, next) { await next(); } })
        .use({ async process(ctx, next) { await next(); } })
        .use({ async process(ctx, next) { await next(); } })
        .use({ async process(ctx, next) { await next(); } })
        .use({ async process(ctx, next) { await next(); } });
      await pipeline.run({});
    }
    const elapsed = Date.now() - start;
    const opsPerSec = Math.floor(ITERATIONS / (elapsed / 1000));

    console.log(`  MediaPipeline (5-stage): ${opsPerSec.toLocaleString()} ops/sec (${ITERATIONS} runs in ${elapsed}ms)`);
    assert.ok(opsPerSec >= 500, `Expected ≥500 ops/sec for 5-stage pipeline, got ${opsPerSec}`);
  });

  it("MediaFile.fromBuffer: >100,000 creates/sec", () => {
    const buf = Buffer.alloc(1024, 0xab);
    const ITERATIONS = 10_000;

    const start = Date.now();
    for (let i = 0; i < ITERATIONS; i++) {
      MediaFile.fromBuffer(buf, { mimeType: "image/jpeg", originalName: "bench.jpg" });
    }
    const elapsed = Date.now() - start;
    const opsPerSec = Math.floor(ITERATIONS / (elapsed / 1000));

    console.log(`  MediaFile.fromBuffer: ${opsPerSec.toLocaleString()} creates/sec (${ITERATIONS} in ${elapsed}ms)`);
    assert.ok(opsPerSec >= 10_000, `Expected ≥10,000 creates/sec for MediaFile, got ${opsPerSec}`);
  });

  it("MediaManager instantiation: >1,000/sec", () => {
    const ITERATIONS = 100;

    const start = Date.now();
    for (let i = 0; i < ITERATIONS; i++) {
      new MediaManager();
    }
    const elapsed = Date.now() - start;
    const opsPerSec = Math.floor(ITERATIONS / (elapsed / 1000));

    console.log(`  MediaManager new: ${opsPerSec.toLocaleString()} creates/sec (${ITERATIONS} in ${elapsed}ms)`);
    assert.ok(opsPerSec >= 10, `Expected ≥10 MediaManager creates/sec, got ${opsPerSec}`);
  });
});
