export class IMultipartUploadProvider {
  createMultipart(path, options = {}) { throw new Error("Method not implemented."); }
  uploadPart(uploadId, partNumber, body) { throw new Error("Method not implemented."); }
  completeMultipart(uploadId, parts = []) { throw new Error("Method not implemented."); }
  abortMultipart(uploadId) { throw new Error("Method not implemented."); }
}
export default IMultipartUploadProvider;
