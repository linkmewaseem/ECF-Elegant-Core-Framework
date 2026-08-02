/**
 * Dedicated Embedding Manager (Chunking, Overlap, Batching, Dimensions).
 */
export class EmbeddingManager {
  constructor(driver) {
    this.driver = driver;
  }

  async embed(text, options = {}) {
    return this.driver.embed(text, options);
  }

  async embedBatch(texts = [], options = {}) {
    const results = [];
    for (const text of texts) {
      results.push(await this.embed(text, options));
    }
    return results;
  }
}

export default EmbeddingManager;
