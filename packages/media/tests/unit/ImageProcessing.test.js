import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { MediaFile } from '../../src/core/MediaFile.js';
import { MediaMetadata } from '../../src/core/MediaMetadata.js';
import { MediaResult } from '../../src/core/MediaResult.js';
import { MediaManager } from '../../src/internal/MediaManager.js';
import { MediaTestingFake } from '../../src/testing/MediaTestingFake.js';
import { NullDriver } from '../../src/drivers/NullDriver.js';
import { MediaProfile, BuiltInProfiles } from '../../src/profiles/MediaProfile.js';
import { MediaPipeline } from '../../src/pipeline/MediaPipeline.js';
import {
  UnsupportedMediaTypeException,
  MediaDriverNotFoundException,
} from '../../src/exceptions/MediaException.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFakeImageBuffer(size = 1024) {
  const buf = Buffer.alloc(size, 0xab);
  return buf;
}

function makeImageFile(mimeType = "image/jpeg", size = 1024) {
  return MediaFile.fromBuffer(makeFakeImageBuffer(size), {
    mimeType,
    originalName: "test.jpg",
  });
}

function makeManager(fake) {
  const manager = new MediaManager();
  manager.extend("fake", fake.getFakeDriver());
  manager.useImageDriver("fake");
  return manager;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("@ecfjs/media — Image Processing (Unit)", () => {

  describe("MediaFile", () => {
    it("creates from buffer", () => {
      const buf = Buffer.from("IMG_DATA");
      const file = MediaFile.fromBuffer(buf, { mimeType: "image/jpeg", originalName: "photo.jpg" });
      assert.equal(file.getMimeType(), "image/jpeg");
      assert.equal(file.getOriginalName(), "photo.jpg");
      assert.ok(file.isImage());
      assert.ok(file.hasBuffer());
      assert.equal(file.getSize(), buf.length);
    });

    it("creates from path", () => {
      const file = MediaFile.fromPath("/uploads/photo.jpg", { mimeType: "image/jpeg" });
      assert.equal(file.getPath(), "/uploads/photo.jpg");
      assert.ok(file.isImage());
      assert.equal(file.getType(), "image");
    });

    it("creates from uploadedFile duck-type", () => {
      const uploadedFile = {
        buffer: Buffer.from("IMG"),
        originalName: "avatar.png",
        mimeType: "image/png",
        size: 3,
      };
      const file = MediaFile.fromUploadedFile(uploadedFile);
      assert.ok(file.isImage());
      assert.equal(file.getMimeType(), "image/png");
    });

    it("detects video type", () => {
      const file = MediaFile.fromBuffer(Buffer.from("VID"), { mimeType: "video/mp4", originalName: "v.mp4" });
      assert.ok(file.isVideo());
      assert.equal(file.getType(), "video");
    });

    it("detects audio type", () => {
      const file = MediaFile.fromBuffer(Buffer.from("AUD"), { mimeType: "audio/mp3", originalName: "a.mp3" });
      assert.ok(file.isAudio());
    });

    it("serializes to object", () => {
      const file = makeImageFile();
      const obj = file.toObject();
      assert.equal(obj.mimeType, "image/jpeg");
      assert.equal(obj.type, "image");
      assert.ok(obj.hasBuffer);
    });
  });

  describe("MediaMetadata", () => {
    it("stores image dimensions and format", () => {
      const meta = new MediaMetadata({ format: "webp", width: 800, height: 600 });
      assert.equal(meta.format, "webp");
      assert.equal(meta.width, 800);
      assert.equal(meta.height, 600);
      assert.ok(meta.isLandscape());
      assert.ok(!meta.isPortrait());
    });

    it("detects portrait images", () => {
      const meta = new MediaMetadata({ width: 400, height: 800 });
      assert.ok(meta.isPortrait());
    });

    it("stores EXIF camera data", () => {
      const meta = new MediaMetadata({
        exif: { Make: "Canon", Model: "EOS R5", ISOSpeedRatings: 400 }
      });
      assert.equal(meta.exif.make, "Canon");
      assert.equal(meta.exif.model, "EOS R5");
      assert.equal(meta.exif.iso, 400);
      assert.ok(meta.hasExif());
    });

    it("detects GPS coordinates", () => {
      const meta = new MediaMetadata({
        gps: { GPSLatitude: 51.5074, GPSLongitude: -0.1278 }
      });
      assert.ok(meta.hasGps());
      assert.equal(meta.gps.latitude, 51.5074);
    });

    it("detects animated images", () => {
      const meta = new MediaMetadata({ pages: 15 });
      assert.ok(meta.isAnimated);
    });

    it("serializes to object", () => {
      const meta = new MediaMetadata({ format: "png", width: 1920, height: 1080 });
      const obj = meta.toObject();
      assert.equal(obj.format, "png");
      assert.equal(obj.width, 1920);
    });
  });

  describe("MediaResult", () => {
    it("creates an immutable result", () => {
      const result = new MediaResult({
        originalName: "photo.jpg",
        mimeType: "image/webp",
        size: 8192,
        storedPath: "images/photo.webp",
        disk: "local",
        variants: {
          thumbnail: { path: "images/photo_thumbnail.webp", width: 200, height: 200, size: 512, format: "webp" },
        },
      });

      assert.equal(result.originalName, "photo.jpg");
      assert.equal(result.disk, "local");
      assert.ok(result.hasVariant("thumbnail"));
      assert.ok(!result.hasVariant("large"));
      assert.deepEqual(result.allVariantNames(), ["thumbnail"]);
    });

    it("is frozen (immutable)", () => {
      const result = new MediaResult({ originalName: "a.jpg", mimeType: "image/jpeg", size: 1 });
      assert.throws(() => { result.originalName = "changed"; }, TypeError);
    });
  });

  describe("MediaProfile", () => {
    it("builds a profile with variants", () => {
      const profile = new MediaProfile("product")
        .addVariant("thumbnail", { width: 200, height: 200, fit: "cover" })
        .addVariant("large", { width: 1200 })
        .format("webp")
        .quality(82);

      assert.equal(profile.getName(), "product");
      assert.equal(profile.getFormat(), "webp");
      assert.equal(profile.getQuality(), 82);
      assert.ok("thumbnail" in profile.getVariants());
      assert.ok("large" in profile.getVariants());
    });

    it("built-in product profile has 3 variants", () => {
      const profile = BuiltInProfiles.product();
      assert.equal(Object.keys(profile.getVariants()).length, 3);
    });

    it("built-in avatar profile has 3 variants", () => {
      const profile = BuiltInProfiles.avatar();
      const variants = profile.getVariants();
      assert.ok("small" in variants);
      assert.ok("medium" in variants);
      assert.ok("large" in variants);
    });

    it("built-in hero profile is responsive", () => {
      const profile = BuiltInProfiles.hero();
      assert.ok(profile.isResponsive());
    });
  });

  describe("MediaPipeline", () => {
    it("executes middleware in order", async () => {
      const pipeline = new MediaPipeline();
      const log = [];

      pipeline
        .use({ async process(ctx, next) { log.push("A"); await next(); } })
        .use({ async process(ctx, next) { log.push("B"); await next(); } })
        .use({ async process(ctx, next) { log.push("C"); await next(); } });

      const ctx = {};
      await pipeline.run(ctx);

      assert.deepEqual(log, ["A", "B", "C"]);
    });

    it("records timing trace per stage", async () => {
      const pipeline = new MediaPipeline();
      pipeline.use({
        async process(ctx, next) {
          ctx.value = "processed";
          await next();
        }
      });

      const ctx = {};
      await pipeline.run(ctx);

      assert.equal(ctx.value, "processed");
      assert.equal(ctx.trace.length, 1);
      assert.ok(ctx.trace[0].durationMs >= 0);
    });

    it("does not fail with empty pipeline", async () => {
      const pipeline = new MediaPipeline();
      const ctx = {};
      await pipeline.run(ctx);
      assert.deepEqual(ctx.trace, []);
    });
  });

  describe("MediaManager + Driver Registry", () => {
    it("registers built-in drivers (sharp, null)", () => {
      const manager = new MediaManager();
      const drivers = manager.availableDrivers();
      assert.ok(drivers.includes("sharp"));
      assert.ok(drivers.includes("null"));
    });

    it("extend() registers a custom driver", () => {
      const manager = new MediaManager();
      const customDriver = { name: () => "imagick", canHandle: () => true };
      manager.extend("imagick", customDriver);
      assert.ok(manager.availableDrivers().includes("imagick"));
    });

    it("throws MediaDriverNotFoundException for unknown driver", () => {
      const manager = new MediaManager();
      assert.throws(() => manager.useImageDriver("nonexistent"), MediaDriverNotFoundException);
    });

    it("throws UnsupportedMediaTypeException for non-image MIME", () => {
      const manager = new MediaManager();
      manager.extend("fake", new NullDriver());
      manager.useImageDriver("null");
      assert.throws(
        () => manager.image(MediaFile.fromBuffer(Buffer.from("VID"), { mimeType: "video/mp4", originalName: "v.mp4" })),
        UnsupportedMediaTypeException
      );
    });

    it("registers built-in profiles", () => {
      const manager = new MediaManager();
      const registry = manager.getProfileRegistry();
      assert.ok(registry.has("product"));
      assert.ok(registry.has("avatar"));
      assert.ok(registry.has("hero"));
      assert.ok(registry.has("banner"));
    });

    it("defineProfile() creates and registers a new profile", () => {
      const manager = new MediaManager();
      manager.defineProfile("custom").addVariant("thumb", { width: 100 });
      assert.ok(manager.getProfileRegistry().has("custom"));
    });
  });

  describe("ImageProcessor — Fluent API + MediaTestingFake", () => {
    it("records resize transformation", async () => {
      const fake = MediaTestingFake.create();
      const manager = makeManager(fake);
      const file = makeImageFile();

      // Store without real storage (no storage manager registered)
      const processor = manager.image(file);
      processor.resize(800, 600);
      processor.webp({ quality: 82 });
      processor.stripMetadata();

      // Simulate internal process call directly on the fake driver
      await manager.driver("fake").process(file, [
        { type: "resize", args: [800, 600, {}] },
        { type: "webp", args: [{ quality: 82 }] },
        { type: "stripMetadata", args: [] },
      ]);

      fake.assertProcessed(1);
      fake.assertResized(800, 600);
      fake.assertFormat("webp");
      fake.assertMetadataStripped();
    });

    it("records watermark transformation", async () => {
      const fake = MediaTestingFake.create();
      const file = makeImageFile();

      await fake.getFakeDriver().process(file, [
        { type: "watermark", args: [Buffer.from("logo"), { gravity: "se" }] },
      ]);

      fake.assertProcessed();
      fake.assertWatermarked();
    });

    it("records grayscale transformation", async () => {
      const fake = MediaTestingFake.create();
      const file = makeImageFile();

      await fake.getFakeDriver().process(file, [{ type: "grayscale", args: [] }]);
      fake.assertGrayscale();
    });

    it("records blur transformation", async () => {
      const fake = MediaTestingFake.create();
      const file = makeImageFile();

      await fake.getFakeDriver().process(file, [{ type: "blur", args: [5] }]);
      fake.assertBlurred();
    });

    it("assertNotProcessed passes when no calls made", () => {
      const fake = MediaTestingFake.create();
      fake.assertNotProcessed();
    });

    it("reset() clears all recorded calls", async () => {
      const fake = MediaTestingFake.create();
      const file = makeImageFile();
      await fake.getFakeDriver().process(file, []);
      assert.equal(fake.callCount(), 1);
      fake.reset();
      assert.equal(fake.callCount(), 0);
    });
  });

  describe("NullDriver", () => {
    it("handles any type (passthrough)", () => {
      const driver = new NullDriver();
      assert.ok(driver.canHandle("image"));
      assert.ok(driver.canHandle("video"));
      assert.ok(driver.canHandle("unknown"));
    });

    it("returns original buffer unchanged", async () => {
      const driver = new NullDriver();
      const buf = Buffer.from("RAW_DATA");
      const file = MediaFile.fromBuffer(buf, { mimeType: "image/jpeg" });
      const { buffer } = await driver.process(file, []);
      assert.deepEqual(buffer, buf);
    });
  });
});
