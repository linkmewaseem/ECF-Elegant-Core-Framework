export class RemoveSearchableJob {
  constructor(searchManager, indexName, documentIds) {
    this.searchManager = searchManager;
    this.indexName = indexName;
    this.documentIds = Array.isArray(documentIds) ? documentIds : [documentIds];
  }

  async handle() {
    if (!this.searchManager || !this.indexName) return;
    await this.searchManager.engine.getIndexer().remove(this.indexName, this.documentIds);
    if (this.searchManager.cacheManager) {
      await this.searchManager.cacheManager.invalidateTag(this.indexName);
    }
  }
}

export default RemoveSearchableJob;
