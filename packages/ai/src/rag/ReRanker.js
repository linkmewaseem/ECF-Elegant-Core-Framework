/**
 * Post-Retrieval ReRanker Engine.
 */
export class ReRanker {
  rerank(query, documents = [], topK = 5) {
    // Simple relevance scoring mock based on word matches
    const scored = documents.map((doc) => {
      const text = typeof doc === 'string' ? doc : doc.content || '';
      const score = query.split(' ').reduce((acc, word) => (text.toLowerCase().includes(word.toLowerCase()) ? acc + 1 : acc), 0);
      return { doc, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map((s) => s.doc);
  }
}

export default ReRanker;
