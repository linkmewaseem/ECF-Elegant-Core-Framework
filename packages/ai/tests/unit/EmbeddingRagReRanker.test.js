import { describe, it } from 'node:test';
import assert from 'node:assert';
import { EmbeddingManager, Chunker, ReRanker, RagPipeline, AiManager, BaseAiDriver } from '../../src/index.js';

describe('Embedding, Chunking, RAG & ReRanker Unit Tests', () => {
  it('should generate vector embeddings', async () => {
    const driver = new BaseAiDriver();
    const embedder = new EmbeddingManager(driver);
    const vector = await embedder.embed('ECF AI Engine');

    assert.strictEqual(vector.length, 1536);
  });

  it('should chunk text using markdown and code chunkers', () => {
    const mdChunks = Chunker.markdown('# Header 1\nSection 1\n## Header 2\nSection 2');
    assert.strictEqual(mdChunks.length, 2);

    const codeChunks = Chunker.code('function foo() {}\n\nfunction bar() {}');
    assert.strictEqual(codeChunks.length, 2);
  });

  it('should rerank documents and execute RAG pipeline', async () => {
    const reranker = new ReRanker();
    const docs = ['JavaScript Framework', 'Python Machine Learning', 'TypeScript Full Stack Framework'];
    const ranked = reranker.rerank('Framework', docs, 2);

    assert.strictEqual(ranked.length, 2);

    const ai = new AiManager();
    const rag = new RagPipeline(ai);
    const result = await ai.rag().execute('What is ECF?', { documents: docs, driver: 'memory' });

    assert.ok(result.answer);
  });
});
