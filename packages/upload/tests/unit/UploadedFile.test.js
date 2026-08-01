import test from "node:test";
import assert from "node:assert/strict";
import UploadedFile from "../../src/core/UploadedFile.js";
import ImageDimensionParser from "../../src/core/ImageDimensionParser.js";

test("UploadedFile - hashing, dimension parsing, and fake factory", () => {
  const fakePng = UploadedFile.fake("test.png", { size: 500 });
  assert.equal(fakePng.originalName, "test.png");
  assert.ok(fakePng.size >= 500);

  const hash = fakePng.hash("sha256");
  assert.equal(hash.length, 64);

  const dims = fakePng.dimensions();
  assert.equal(dims.valid, true);
  assert.equal(dims.width, 100);
  assert.equal(dims.height, 100);
});

test("ImageDimensionParser - parses PNG and GIF header dimensions", () => {
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02, 0x00 // 256 x 512
  ]);

  const dims = ImageDimensionParser.parse(pngHeader);
  assert.equal(dims.valid, true);
  assert.equal(dims.width, 256);
  assert.equal(dims.height, 512);
});
