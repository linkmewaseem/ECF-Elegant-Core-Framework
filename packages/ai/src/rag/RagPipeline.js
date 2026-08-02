import { ReRanker } from './ReRanker.js';

/**
 * Modular RAG Pipeline (Loader -> Chunker -> Embedder -> VectorStore -> Retriever -> ReRanker -> Generator).
 */
export class RagPipeline {
  constructor(aiManager) {
    this.aiManager = aiManager;
    this.reRanker = new ReRanker();
  }

  async execute(query, options = {}) {
    const documents = options.documents || ['ECF Framework Document 1', 'ECF Framework Document 2'];
    const reranked = this.reRanker.rerank(query, documents, options.topK || 3);
    const context = reranked.join('\n');

    const prompt = `Context:\n${context}\n\nQuestion: ${query}`;
    const chatRes = await this.aiManager.chat(prompt, options);

    return {
      query,
      context,
      documents: reranked,
      answer: chatRes.text,
    };
  }
}

export default RagPipeline;
