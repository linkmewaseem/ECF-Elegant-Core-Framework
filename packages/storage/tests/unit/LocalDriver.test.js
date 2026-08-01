import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import LocalDriver from "../../src/drivers/LocalDriver.js";

const testDir = path.resolve("./storage/test-tmp");

test("LocalDriver - put, get, exists, delete, copy, move", async () => {
  const driver = new LocalDriver({ root: testDir });
  const file = "documents/test.txt";
  const content = "Hello ECF Storage Platform!";

  // Put
  await driver.put(file, content, { visibility: "public" });
  assert.equal(await driver.exists(file), true);

  // Get
  const fetched = await driver.get(file);
  assert.equal(fetched, content);

  // Checksum
  const checksum = await driver.checksum(file, "sha256");
  assert.ok(checksum.length > 0);

  // Copy
  const copyFile = "documents/test-copy.txt";
  await driver.copy(file, copyFile);
  assert.equal(await driver.exists(copyFile), true);

  // Move
  const movedFile = "documents/test-moved.txt";
  await driver.move(copyFile, movedFile);
  assert.equal(await driver.exists(copyFile), false);
  assert.equal(await driver.exists(movedFile), true);

  // Delete
  await driver.delete(file);
  await driver.delete(movedFile);
  assert.equal(await driver.exists(file), false);

  // Clean test dir
  await fs.promises.rm(testDir, { recursive: true, force: true }).catch(() => {});
});

test("LocalDriver - readStream and writeStream", async () => {
  const driver = new LocalDriver({ root: testDir });
  const streamFile = "streams/large.txt";
  const content = "Stream Data Chunk 123";

  const inputStream = Readable.from([Buffer.from(content)]);
  await driver.writeStream(streamFile, inputStream);

  assert.equal(await driver.exists(streamFile), true);

  const outputStream = await driver.readStream(streamFile);
  const chunks = [];
  for await (const chunk of outputStream) {
    chunks.push(chunk);
  }
  const readContent = Buffer.concat(chunks).toString("utf8");
  assert.equal(readContent, content);

  await fs.promises.rm(testDir, { recursive: true, force: true }).catch(() => {});
});
