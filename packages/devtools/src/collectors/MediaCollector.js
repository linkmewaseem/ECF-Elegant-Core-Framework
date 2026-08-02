export class MediaCollector {
  collectProcessed(requestRecord, resultData) {
    if (requestRecord) {
      requestRecord.addMedia({
        originalName: resultData.originalName ?? 'media',
        variantsCount: Object.keys(resultData.variants ?? {}).length,
        storedPath: resultData.storedPath ?? null,
        durationMs: resultData.durationMs ?? 0,
        at: Date.now() - requestRecord.startedAt,
      });
    }
  }
}

export default MediaCollector;
