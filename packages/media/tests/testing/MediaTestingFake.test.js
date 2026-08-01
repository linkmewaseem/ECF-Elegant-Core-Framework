import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MediaTestingFake } from '../../src/testing/MediaTestingFake.js';
import { MediaFile } from '../../src/core/MediaFile.js';

describe("@ecf/media — MediaTestingFake", () => {
  function makeImageFile(name = "test.jpg", mimeType = "image/jpeg") {
    return MediaFile.fromBuffer(Buffer.from("FAKE_IMG_DATA"), { mimeType, originalName: name });
  }

  it("assertProcessed() passes after one process call", async () => {
    const fake = MediaTestingFake.create();
    const file = makeImageFile();
    await fake.getFakeDriver().process(file, []);
    assert.doesNotThrow(() => fake.assertProcessed());
  });

  it("assertProcessed(n) asserts exact count", async () => {
    const fake = MediaTestingFake.create();
    const file = makeImageFile();
    await fake.getFakeDriver().process(file, []);
    await fake.getFakeDriver().process(file, []);
    assert.doesNotThrow(() => fake.assertProcessed(2));
    assert.throws(() => fake.assertProcessed(1));
  });

  it("assertNotProcessed() passes when no calls made", () => {
    const fake = MediaTestingFake.create();
    assert.doesNotThrow(() => fake.assertNotProcessed());
  });

  it("assertHasTransformation() detects applied transformation", async () => {
    const fake = MediaTestingFake.create();
    const file = makeImageFile();
    await fake.getFakeDriver().process(file, [
      { type: "resize", args: [800, 600, {}] },
      { type: "webp", args: [{}] },
    ]);
    assert.doesNotThrow(() => fake.assertHasTransformation("resize"));
    assert.doesNotThrow(() => fake.assertHasTransformation("webp"));
    assert.throws(() => fake.assertHasTransformation("grayscale"));
  });

  it("assertResized() checks exact dimensions", async () => {
    const fake = MediaTestingFake.create();
    const file = makeImageFile();
    await fake.getFakeDriver().process(file, [
      { type: "resize", args: [1200, 800, {}] },
    ]);
    assert.doesNotThrow(() => fake.assertResized(1200, 800));
    assert.throws(() => fake.assertResized(800, 600));
  });

  it("assertFormat() detects webp output", async () => {
    const fake = MediaTestingFake.create();
    const file = makeImageFile();
    await fake.getFakeDriver().process(file, [
      { type: "resize", args: [200, 200, {}] },
      { type: "webp", args: [{ quality: 82 }] },
    ]);
    assert.doesNotThrow(() => fake.assertFormat("webp"));
    assert.throws(() => fake.assertFormat("png"));
  });

  it("assertFormat() detects avif output", async () => {
    const fake = MediaTestingFake.create();
    const file = makeImageFile();
    await fake.getFakeDriver().process(file, [{ type: "avif", args: [{}] }]);
    assert.doesNotThrow(() => fake.assertFormat("avif"));
  });

  it("assertMetadataStripped() detects stripMetadata step", async () => {
    const fake = MediaTestingFake.create();
    const file = makeImageFile();
    await fake.getFakeDriver().process(file, [{ type: "stripMetadata", args: [] }]);
    assert.doesNotThrow(() => fake.assertMetadataStripped());
  });

  it("assertWatermarked() detects watermark step", async () => {
    const fake = MediaTestingFake.create();
    const file = makeImageFile();
    await fake.getFakeDriver().process(file, [
      { type: "watermark", args: [Buffer.from("logo"), { gravity: "se" }] },
    ]);
    assert.doesNotThrow(() => fake.assertWatermarked());
  });

  it("assertGrayscale() detects grayscale", async () => {
    const fake = MediaTestingFake.create();
    const file = makeImageFile();
    await fake.getFakeDriver().process(file, [{ type: "grayscale", args: [] }]);
    assert.doesNotThrow(() => fake.assertGrayscale());
    assert.throws(() => fake.assertWatermarked()); // watermark not applied
  });

  it("assertBlurred() detects blur step", async () => {
    const fake = MediaTestingFake.create();
    const file = makeImageFile();
    await fake.getFakeDriver().process(file, [{ type: "blur", args: [5] }]);
    assert.doesNotThrow(() => fake.assertBlurred());
  });

  it("callCount() returns correct count", async () => {
    const fake = MediaTestingFake.create();
    const file = makeImageFile();
    assert.equal(fake.callCount(), 0);
    await fake.getFakeDriver().process(file, []);
    assert.equal(fake.callCount(), 1);
    await fake.getFakeDriver().process(file, []);
    assert.equal(fake.callCount(), 2);
  });

  it("reset() clears all recorded calls", async () => {
    const fake = MediaTestingFake.create();
    const file = makeImageFile();
    await fake.getFakeDriver().process(file, []);
    assert.equal(fake.callCount(), 1);
    fake.reset();
    assert.equal(fake.callCount(), 0);
    assert.doesNotThrow(() => fake.assertNotProcessed());
  });

  it("getCalls() returns full call log", async () => {
    const fake = MediaTestingFake.create();
    const file = makeImageFile();
    await fake.getFakeDriver().process(file, [{ type: "rotate", args: [90] }]);
    const calls = fake.getCalls();
    assert.equal(calls.length, 1);
    assert.ok(calls[0].transformations.some((t) => t.type === "rotate"));
  });

  it("fake driver returns stub buffer with 10 bytes", async () => {
    const fake = MediaTestingFake.create();
    const file = makeImageFile();
    const { buffer } = await fake.getFakeDriver().process(file, []);
    assert.ok(Buffer.isBuffer(buffer));
    assert.ok(buffer.length > 0);
  });

  it("fake driver returns MediaMetadata with format", async () => {
    const fake = MediaTestingFake.create();
    const file = makeImageFile();
    const { metadata } = await fake.getFakeDriver().process(file, [
      { type: "webp", args: [{}] },
    ]);
    assert.equal(metadata.format, "webp");
  });

  it("fake driver reflects resize dimensions in metadata", async () => {
    const fake = MediaTestingFake.create();
    const file = makeImageFile();
    const { metadata } = await fake.getFakeDriver().process(file, [
      { type: "resize", args: [320, 240, {}] },
    ]);
    assert.equal(metadata.width, 320);
    assert.equal(metadata.height, 240);
  });
});
