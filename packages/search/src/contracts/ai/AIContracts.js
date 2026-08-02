export class EmbeddingProvider {
  async embed(text) {
    throw new Error("EmbeddingProvider marker interface.");
  }
}

export class VectorStore {
  async searchVector(vector, options = {}) {
    throw new Error("VectorStore marker interface.");
  }
}

export class SemanticRanker {
  async rerank(query, documents) {
    throw new Error("SemanticRanker marker interface.");
  }
}

export class HybridSearch {
  async hybridSearch(query, vector, options = {}) {
    throw new Error("HybridSearch marker interface.");
  }
}

export class LLMQueryExpander {
  async expand(query) {
    throw new Error("LLMQueryExpander marker interface.");
  }
}
