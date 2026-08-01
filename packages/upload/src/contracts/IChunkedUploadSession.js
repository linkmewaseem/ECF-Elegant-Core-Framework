export class IChunkedUploadSession {
  initiate(fileName, totalSize, chunkSize) { throw new Error("Method not implemented."); }
  appendChunk(sessionId, chunkIndex, buffer) { throw new Error("Method not implemented."); }
  assemble(sessionId) { throw new Error("Method not implemented."); }
  status(sessionId) { throw new Error("Method not implemented."); }
}
export default IChunkedUploadSession;
