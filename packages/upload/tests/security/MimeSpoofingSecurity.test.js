import test from "node:test";
import assert from "node:assert/strict";
import UploadedFile from "../../src/core/UploadedFile.js";
import MagicByteSniffer from "../../src/core/MagicByteSniffer.js";
import MagicByteSniffingStep from "../../src/pipeline/MagicByteSniffingStep.js";
import { InvalidMagicBytesException } from "../../src/exceptions/UploadException.js";

test("MimeSpoofingSecurity - MagicByteSniffer correctly sniffs real header signatures", () => {
  const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  assert.equal(MagicByteSniffer.sniff(jpegHeader), "image/jpeg");

  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(MagicByteSniffer.sniff(pngHeader), "image/png");

  const pdfHeader = Buffer.from("%PDF-1.4 header contents");
  assert.equal(MagicByteSniffer.sniff(pdfHeader), "application/pdf");
});

test("MimeSpoofingSecurity - rejects spoofed files claiming to be images with fake headers", async () => {
  const fakeExecBuffer = Buffer.from("MZ binary executable content");
  const spoofedFile = new UploadedFile({
    originalName: "fake.jpg",
    mimeType: "image/jpeg",
    buffer: fakeExecBuffer
  });

  const step = new MagicByteSniffingStep();

  await assert.rejects(async () => {
    await step.handle(spoofedFile, async (f) => f);
  }, InvalidMagicBytesException);
});
