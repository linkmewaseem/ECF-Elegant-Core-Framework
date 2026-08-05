import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MediaSecurityValidator } from '../../src/security/MediaSecurityValidator.js';
import { MediaSecurityException, MediaValidationException } from '../../src/exceptions/MediaException.js';

describe("@ecfjs/media — Security Tests", () => {

  describe("Pixel Bomb Detection", () => {
    it("allows normal image dimensions", () => {
      // 4000×3000 = 12M pixels — well within limit
      assert.doesNotThrow(() =>
        MediaSecurityValidator.validateImageMeta({ width: 4000, height: 3000, pages: 1 })
      );
    });

    it("rejects pixel bomb (width × height exceeds 256MP)", () => {
      assert.throws(
        () => MediaSecurityValidator.validateImageMeta({ width: 16385, height: 16385, pages: 1 }),
        MediaSecurityException
      );
    });

    it("rejects single-dimension exceeding MAX_IMAGE_DIMENSION", () => {
      assert.throws(
        () => MediaSecurityValidator.validateImageMeta({ width: 20000, height: 100, pages: 1 }),
        MediaSecurityException
      );
    });
  });

  describe("Memory Exhaustion (Canvas) Protection", () => {
    it("rejects image that would use >1GB RAM when decompressed (many animated frames)", () => {
      // 8192×8192 pixels × 4 bytes RGBA × 40 frames = ~10.7GB — triggers canvas limit
      // Pixel count: 67M — below 256MP limit (so pixel bomb check won't fire first)
      assert.throws(
        () => MediaSecurityValidator.validateImageMeta({ width: 8192, height: 8192, pages: 40 }),
        MediaSecurityException
      );
    });
  });

  describe("Animated GIF Frame Limit", () => {
    it("allows animated GIF within frame limit", () => {
      assert.doesNotThrow(() =>
        MediaSecurityValidator.validateImageMeta({ width: 640, height: 480, pages: 50 })
      );
    });

    it("rejects animated GIF exceeding MAX_ANIMATED_FRAMES", () => {
      assert.throws(
        () => MediaSecurityValidator.validateImageMeta({ width: 100, height: 100, pages: 300 }),
        MediaSecurityException
      );
    });
  });

  describe("Zip Bomb Detection", () => {
    it("detects tiny compressed file with huge canvas (compression ratio > 10000)", () => {
      // 1 byte buffer → 4000×4000×4 = 64MB canvas → ratio 64M:1
      const tinyBuffer = Buffer.alloc(1);
      assert.throws(
        () => MediaSecurityValidator.validateImageMeta({ width: 4000, height: 4000, pages: 1 }, tinyBuffer),
        MediaSecurityException
      );
    });

    it("allows reasonable compression ratios", () => {
      // 100KB buffer → 800×600×4 = 1.92MB canvas → ratio ~20:1 (safe)
      const buffer = Buffer.alloc(100 * 1024);
      assert.doesNotThrow(() =>
        MediaSecurityValidator.validateImageMeta({ width: 800, height: 600, pages: 1 }, buffer)
      );
    });
  });

  describe("SVG Security Validator", () => {
    it("allows clean SVG", () => {
      const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100"/></svg>`);
      assert.doesNotThrow(() => MediaSecurityValidator.validateSvg(svg));
    });

    it("rejects SVG with <script> tag", () => {
      const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`);
      assert.throws(() => MediaSecurityValidator.validateSvg(svg), MediaSecurityException);
    });

    it("rejects SVG with inline event handler (onclick)", () => {
      const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg"><rect onclick="evil()"/></svg>`);
      assert.throws(() => MediaSecurityValidator.validateSvg(svg), MediaSecurityException);
    });

    it("rejects SVG with external href reference", () => {
      const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg"><image href="http://evil.com/x.svg"/></svg>`);
      assert.throws(() => MediaSecurityValidator.validateSvg(svg), MediaSecurityException);
    });

    it("allows SVG with data: URI (inline image)", () => {
      const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg"><image href="data:image/png;base64,abc"/></svg>`);
      assert.doesNotThrow(() => MediaSecurityValidator.validateSvg(svg));
    });

    it("rejects SVG with <foreignObject>", () => {
      const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><div>evil</div></foreignObject></svg>`);
      assert.throws(() => MediaSecurityValidator.validateSvg(svg), MediaSecurityException);
    });

    it("rejects SVG with DOCTYPE entity declaration", () => {
      const svg = Buffer.from(`<!DOCTYPE svg [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><svg/>`);
      assert.throws(() => MediaSecurityValidator.validateSvg(svg), MediaSecurityException);
    });
  });

  describe("File Size Validation", () => {
    it("allows files within size limit", () => {
      assert.doesNotThrow(() => MediaSecurityValidator.validateFileSize(10 * 1024 * 1024)); // 10MB
    });

    it("rejects files exceeding 500MB limit", () => {
      assert.throws(
        () => MediaSecurityValidator.validateFileSize(501 * 1024 * 1024),
        MediaValidationException
      );
    });
  });
});
