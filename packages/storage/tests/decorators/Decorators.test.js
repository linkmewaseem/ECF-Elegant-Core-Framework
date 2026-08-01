import test from "node:test";
import assert from "node:assert/strict";
import MemoryDriver from "../../src/drivers/MemoryDriver.js";
import EncryptionDecorator from "../../src/decorators/EncryptionDecorator.js";
import CompressionDecorator from "../../src/decorators/CompressionDecorator.js";
import ReadOnlyDecorator from "../../src/decorators/ReadOnlyDecorator.js";
import StoragePoolDriver from "../../src/drivers/StoragePoolDriver.js";
import { UnableToWriteException } from "../../src/exceptions/StorageException.js";

test("EncryptionDecorator - transparent AES-256-GCM encryption/decryption", async () => {
  const baseDriver = new MemoryDriver();
  const encryptedDriver = new EncryptionDecorator(baseDriver, "my-secret-key");

  const originalText = "Top Secret Classified Data 123";
  await encryptedDriver.put("secret.txt", originalText);

  // Raw stored data in base memory driver is encrypted buffer
  const rawData = await baseDriver.get("secret.txt");
  assert.notEqual(rawData, originalText, "Raw stored bytes must be encrypted");

  // Decrypted via decorator
  const decrypted = await encryptedDriver.get("secret.txt");
  assert.equal(decrypted, originalText);
});

test("CompressionDecorator - transparent Gzip compression", async () => {
  const baseDriver = new MemoryDriver();
  const compressedDriver = new CompressionDecorator(baseDriver);

  const text = "Compress me!".repeat(100);
  await compressedDriver.put("data.txt", text);

  const decompressed = await compressedDriver.get("data.txt");
  assert.equal(decompressed, text);
});

test("ReadOnlyDecorator - blocks write/delete operations", async () => {
  const baseDriver = new MemoryDriver();
  await baseDriver.put("existing.txt", "read-only-content");

  const readOnly = new ReadOnlyDecorator(baseDriver);

  assert.equal(await readOnly.get("existing.txt"), "read-only-content");

  await assert.rejects(async () => {
    await readOnly.put("new.txt", "data");
  }, UnableToWriteException);
});

test("StoragePoolDriver - fallback priority execution", async () => {
  const primary = new MemoryDriver();
  const secondary = new MemoryDriver();
  const pool = new StoragePoolDriver([primary, secondary]);

  await pool.put("file.txt", "Pool Data");
  assert.equal(await pool.get("file.txt"), "Pool Data");
});
