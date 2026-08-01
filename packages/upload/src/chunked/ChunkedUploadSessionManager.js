import crypto from "node:crypto";
import UploadedFile from "../core/UploadedFile.js";
import { UploadSessionExpiredException } from "../exceptions/UploadException.js";

export class ChunkedUploadSessionManager {
  constructor() {
    this.sessions = new Map(); // sessionId -> { fileName, totalSize, chunkSize, chunks: Map<index, Buffer>, createdAt, updatedAt }
  }

  initiate(fileName, totalSize, chunkSize = 1024 * 1024) {
    const sessionId = `tus_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
    this.sessions.set(sessionId, {
      sessionId,
      fileName,
      totalSize,
      chunkSize,
      chunks: new Map(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return sessionId;
  }

  appendChunk(sessionId, chunkIndex, buffer) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new UploadSessionExpiredException(sessionId);
    }

    session.chunks.set(chunkIndex, Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer));
    session.updatedAt = new Date();

    return this.status(sessionId);
  }

  status(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new UploadSessionExpiredException(sessionId);
    }

    let uploadedSize = 0;
    for (const chunk of session.chunks.values()) {
      uploadedSize += chunk.length;
    }

    return {
      sessionId,
      fileName: session.fileName,
      totalSize: session.totalSize,
      uploadedSize,
      chunkCount: session.chunks.size,
      completed: uploadedSize >= session.totalSize
    };
  }

  assemble(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new UploadSessionExpiredException(sessionId);
    }

    const sortedIndexes = Array.from(session.chunks.keys()).sort((a, b) => a - b);
    const chunkBuffers = sortedIndexes.map(idx => session.chunks.get(idx));
    const combined = Buffer.concat(chunkBuffers);

    this.sessions.delete(sessionId);

    return new UploadedFile({
      originalName: session.fileName,
      name: session.fileName,
      buffer: combined
    });
  }

  cleanupAbandoned(maxAgeMs = 24 * 3600 * 1000) {
    const now = Date.now();
    let purgedCount = 0;
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.updatedAt.getTime() > maxAgeMs) {
        this.sessions.delete(id);
        purgedCount++;
      }
    }
    return purgedCount;
  }
}

export default ChunkedUploadSessionManager;
