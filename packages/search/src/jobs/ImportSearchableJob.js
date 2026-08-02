export class ImportSearchableJob {
  constructor(searchManager, indexName, documents) {
    this.searchManager = searchManager;
    this.indexName = indexName;
    this.documents = Array.isArray(documents) ? documents : [documents];
  }

  async handle() {
    if (!this.searchManager || !this.indexName) return;
    await this.searchManager.engine.getIndexer().index(this.indexName, this.documents);
    if (this.searchManager.cacheManager) {
      await this.searchManager.cacheManager.invalidateTag(this.indexName);
    }
  }
}

export default ImportSearchableJob;
