export class UploadCollector {
  collectUpload(requestRecord, fileInfo) {
    if (requestRecord) {
      requestRecord.addUpload({
        name: fileInfo.name ?? 'uploaded_file',
        mimeType: fileInfo.mimeType ?? 'application/octet-stream',
        size: fileInfo.size ?? 0,
        hash: fileInfo.hash ?? null,
        scanned: fileInfo.scanned ?? true,
        isClean: fileInfo.isClean ?? true,
        at: Date.now() - requestRecord.startedAt,
      });
    }
  }
}

export default UploadCollector;
