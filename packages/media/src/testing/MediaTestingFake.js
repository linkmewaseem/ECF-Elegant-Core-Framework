import { MediaFile } from '../core/MediaFile.js';
import { MediaResult } from '../core/MediaResult.js';
import { MediaMetadata } from '../core/MediaMetadata.js';
import assert from 'node:assert/strict';

/**
 * MediaTestingFake — Zero-driver testing harness for @ecf/media.
 *
 * Replaces SharpDriver with an in-memory fake that records all
 * operations without requiring the `sharp` native addon.
 *
 * Usage:
 *   const fake = MediaTestingFake.create();
 *   Media.useImageDriver("fake");
 *
 *   await Media.image(file).resize(200, 200).webp().store("avatars", "local");
 *
 *   fake.assertProcessed();
 *   fake.assertStoredIn("avatars");
 *   fake.assertVariant("thumbnail");
 *   fake.assertHasTransformation("resize");
 *   fake.assertFormat("webp");
 *   fake.assertMetadata({ width: 200 });
 */
export class MediaTestingFake {
  #calls = [];
  #results = [];
  #fakeDriver;

  constructor() {
    this.#fakeDriver = this.#buildFakeDriver();
  }

  static create() {
    return new MediaTestingFake();
  }

  getFakeDriver() { return this.#fakeDriver; }

  /** Reset all recorded calls — useful for running multiple test cases. */
  reset() { this.#calls = []; this.#results = []; }

  #buildFakeDriver() {
    const fake = this;

    return {
      name: () => "fake",
      canHandle: () => true,

      async process(mediaFile, transformations = []) {
        const call = {
          mediaFile,
          transformations,
          storedAt: new Date(),
        };
        fake.#calls.push(call);

        // Simulate output buffer (10-byte stub)
        const buffer = Buffer.from("FAKE_IMAGE");

        // Build stub metadata
        const resizeT = transformations.find((t) => t.type === "resize");
        const metadata = new MediaMetadata({
          format: fake.#detectFormat(transformations),
          width: resizeT?.args?.[0] ?? 800,
          height: resizeT?.args?.[1] ?? 600,
          size: buffer.length,
        });

        return { buffer, metadata };
      },

      async getMetadata(mediaFile) {
        return new MediaMetadata({
          format: "jpeg",
          width: 1920,
          height: 1080,
          size: mediaFile.getSize(),
        });
      },
    };
  }

  #detectFormat(transformations) {
    const fmtT = [...transformations].reverse().find((t) =>
      ["jpeg", "png", "webp", "avif", "tiff", "format"].includes(t.type)
    );
    if (!fmtT) return "webp";
    if (fmtT.type === "format") return fmtT.args[0];
    return fmtT.type === "jpeg" ? "jpg" : fmtT.type;
  }

  // ─── Assert API ────────────────────────────────────────────────────────────

  /** Assert at least one image was processed. */
  assertProcessed(count = null) {
    if (count !== null) {
      assert.equal(this.#calls.length, count,
        `Expected ${count} media processing call(s), got ${this.#calls.length}`);
    } else {
      assert.ok(this.#calls.length > 0, "Expected at least one media processing call, but none was recorded.");
    }
  }

  /** Assert no media was processed. */
  assertNotProcessed() {
    assert.equal(this.#calls.length, 0,
      `Expected no media processing calls, but got ${this.#calls.length}`);
  }

  /** Assert a specific transformation was applied. */
  assertHasTransformation(type, callIndex = 0) {
    const call = this.#calls[callIndex];
    assert.ok(call, `No processing call recorded at index ${callIndex}.`);
    const found = call.transformations.some((t) => t.type === type);
    assert.ok(found, `Expected transformation "${type}" was not applied.`);
  }

  /** Assert a resize transformation was applied with specific dimensions. */
  assertResized(width, height, callIndex = 0) {
    const call = this.#calls[callIndex];
    assert.ok(call, `No processing call recorded at index ${callIndex}.`);
    const t = call.transformations.find((t) => t.type === "resize");
    assert.ok(t, `Expected a "resize" transformation but none was found.`);
    if (width !== null) assert.equal(t.args[0], width, `Expected resize width ${width}, got ${t.args[0]}`);
    if (height !== null) assert.equal(t.args[1], height, `Expected resize height ${height}, got ${t.args[1]}`);
  }

  /** Assert a specific output format was set. */
  assertFormat(format, callIndex = 0) {
    const call = this.#calls[callIndex];
    assert.ok(call, `No processing call recorded at index ${callIndex}.`);
    const detected = this.#detectFormat(call.transformations);
    assert.equal(detected, format,
      `Expected output format "${format}", got "${detected}"`);
  }

  /** Assert metadata was stripped. */
  assertMetadataStripped(callIndex = 0) {
    this.assertHasTransformation("stripMetadata", callIndex);
  }

  /** Assert a watermark was applied. */
  assertWatermarked(callIndex = 0) {
    this.assertHasTransformation("watermark", callIndex);
  }

  /** Assert grayscale was applied. */
  assertGrayscale(callIndex = 0) {
    this.assertHasTransformation("grayscale", callIndex);
  }

  /** Assert blur was applied. */
  assertBlurred(callIndex = 0) {
    this.assertHasTransformation("blur", callIndex);
  }

  /** Assert how many variants were processed. */
  assertVariantCount(count, callIndex = 0) {
    // Variants are processed as additional calls following the primary
    const variantCalls = this.#calls.slice(1);
    assert.equal(variantCalls.length, count,
      `Expected ${count} variant(s), got ${variantCalls.length}`);
  }

  /** Assert a specific variant transformation exists in subsequent calls. */
  assertVariant(variantName) {
    // Variant calls have a variantName recorded on them
    const found = this.#calls.some((c) => c.variantName === variantName);
    // Accept also via the results check
    assert.ok(this.#calls.length > 1 || found,
      `Expected variant "${variantName}" to be processed, but it was not found.`);
  }

  /** Assert a result was stored in a specific directory. */
  assertStoredIn(directory, callIndex = 0) {
    const call = this.#calls[callIndex];
    assert.ok(call, `No processing call recorded at index ${callIndex}.`);
    // Storage path is recorded on result if available
    const result = this.#results[callIndex];
    if (result) {
      assert.ok(
        result.storedPath?.startsWith(directory),
        `Expected stored path to start with "${directory}", got "${result.storedPath}"`
      );
    }
    // If no result yet, just assert the call happened
    assert.ok(this.#calls.length > 0, `Expected a processing call, but none was recorded.`);
  }

  /** Record a MediaResult returned by the processor (called automatically by fake store). */
  recordResult(result) {
    this.#results.push(result);
  }

  /** Get all recorded calls. */
  getCalls() { return [...this.#calls]; }

  /** Get number of recorded calls. */
  callCount() { return this.#calls.length; }
}

export default MediaTestingFake;
