import ImportSearchableJob from "../jobs/ImportSearchableJob.js";
import RemoveSearchableJob from "../jobs/RemoveSearchableJob.js";

export const Searchable = {
  searchableAs() {
    return this.constructor.name.toLowerCase() + "s";
  },

  toSearchableArray() {
    const { ...data } = this;
    return data;
  },

  shouldBeSearchable() {
    return true;
  },

  async searchable(searchManager = null, queueManager = null) {
    if (!this.shouldBeSearchable()) return;

    const indexName = this.searchableAs();
    const doc = this.toSearchableArray();

    if (queueManager && searchManager) {
      const job = new ImportSearchableJob(searchManager, indexName, doc);
      await queueManager.push(job);
    } else if (searchManager) {
      await searchManager.engine.getIndexer().index(indexName, doc);
    }
  },

  async unsearchable(searchManager = null, queueManager = null) {
    const indexName = this.searchableAs();
    const id = this.id || this.getKey?.();

    if (queueManager && searchManager) {
      const job = new RemoveSearchableJob(searchManager, indexName, id);
      await queueManager.push(job);
    } else if (searchManager) {
      await searchManager.engine.getIndexer().remove(indexName, id);
    }
  },
};

export default Searchable;
