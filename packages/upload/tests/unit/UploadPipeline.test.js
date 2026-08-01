import test from "node:test";
import assert from "node:assert/strict";
import UploadedFile from "../../src/core/UploadedFile.js";
import UploadPipeline from "../../src/pipeline/UploadPipeline.js";
import MimeValidationStep from "../../src/pipeline/MimeValidationStep.js";
import SizeValidationStep from "../../src/pipeline/SizeValidationStep.js";
import DimensionValidationStep from "../../src/pipeline/DimensionValidationStep.js";
import { FileValidationException } from "../../src/exceptions/UploadException.js";

test("UploadPipeline - processes valid files through validation steps", async () => {
  const file = UploadedFile.fake("photo.png", { size: 1024, mime: "image/png" });

  const pipeline = new UploadPipeline([
    new MimeValidationStep(["image/png", "image/jpeg"]),
    new SizeValidationStep({ minSize: 100, maxSize: 10000 }),
    new DimensionValidationStep({ minWidth: 10, maxWidth: 1000 })
  ]);

  const processed = await pipeline.process(file);
  assert.equal(processed.originalName, "photo.png");
});

test("UploadPipeline - rejects invalid size or MIME type", async () => {
  const largeFile = UploadedFile.fake("huge.png", { size: 50000, mime: "image/png" });

  const pipeline = new UploadPipeline([
    new SizeValidationStep({ maxSize: 10000 })
  ]);

  await assert.rejects(async () => {
    await pipeline.process(largeFile);
  }, FileValidationException);
});
