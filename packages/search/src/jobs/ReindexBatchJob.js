export class ReindexBatchJob {
  constructor(searchManager, indexName, items, chunkSize = 100) {
    this.searchManager = searchManager;
    this.indexName = indexName;
    this.items = items;
    this.chunkSize = chunkSize;
  }

  async handle() {
    if (!this.searchManager || !this.items || this.items.length === 0) return;

    const total = this.items.length;
    let processed = 0;

    for (let i = 0; i < total; i += this.chunkSize) {
      const chunk = this.items.slice(i, i + this.chunkSize);
      const docs = chunk.map((item) => (typeof item.toSearchableArray === "function" ? item.toSearchableArray() : item));
      await this.searchManager.engine.getIndexer().index(this.indexName, docs);
      processed += chunk.length;

      const progressPercent = Math.round((processed / total) * 100);

      if (this.searchManager.broadcastManager) {
        await this.searchManager.broadcastManager.to(`search.reindex.${this.indexName}`).emit("ReindexProgress", {
          index: this.indexName,
          processed,
          total,
          percent: progressPercent,
        });
      }
    }
  }
}

export default ReindexBatchJob;
