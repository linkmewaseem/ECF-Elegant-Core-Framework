export class SuggestionsEngine {
  constructor() {
    this.popularQueries = new Map();
    this.recentQueries = [];
  }

  recordQuery(term) {
    if (!term || typeof term !== "string") return;
    const clean = term.trim().toLowerCase();
    if (!clean) return;

    const count = this.popularQueries.get(clean) || 0;
    this.popularQueries.set(clean, count + 1);

    this.recentQueries.unshift(clean);
    if (this.recentQueries.length > 50) {
      this.recentQueries.pop();
    }
  }

  suggest(prefix, limit = 5) {
    if (!prefix) return [];
    const p = prefix.trim().toLowerCase();
    const matches = Array.from(this.popularQueries.keys()).filter((q) => q.startsWith(p));
    return matches.slice(0, limit);
  }

  getPopular(limit = 10) {
    return Array.from(this.popularQueries.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query]) => query);
  }

  getRecent(limit = 10) {
    return Array.from(new Set(this.recentQueries)).slice(0, limit);
  }
}

export default SuggestionsEngine;
