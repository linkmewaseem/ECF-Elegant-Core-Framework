import test from "node:test";
import assert from "node:assert/strict";
import ChunkedUploadSessionManager from "../../src/chunked/ChunkedUploadSessionManager.js";

test("ChunkedUploadSessionManager - initiates, appends chunks, tracks status, and assembles", () => {
  const manager = new ChunkedUploadSessionManager();
  const fileName = "big-video.mp4";
  const chunk1 = Buffer.from("CHUNK_1_DATA_");
  const chunk2 = Buffer.from("CHUNK_2_DATA");
  const totalSize = chunk1.length + chunk2.length;

  const sessionId = manager.initiate(fileName, totalSize);
  assert.ok(sessionId.startsWith("tus_"));

  manager.appendChunk(sessionId, 0, chunk1);
  const status1 = manager.status(sessionId);
  assert.equal(status1.chunkCount, 1);
  assert.equal(status1.completed, false);

  manager.appendChunk(sessionId, 1, chunk2);
  const status2 = manager.status(sessionId);
  assert.equal(status2.completed, true);

  const assembled = manager.assemble(sessionId);
  assert.equal(assembled.originalName, fileName);
  assert.equal(assembled.buffer.toString("utf8"), "CHUNK_1_DATA_CHUNK_2_DATA");
});
