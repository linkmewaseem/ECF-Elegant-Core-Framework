/**
 * Semantic & Hash Caching Engine.
 */
export class SemanticCache {
  #store = new Map();

  get(prompt) {
    return this.#store.get(prompt);
  }

  set(prompt, response, ttlMs = 600000) {
    this.#store.set(prompt, { response, expiresAt: Date.now() + ttlMs });
  }
}

export default SemanticCache;
