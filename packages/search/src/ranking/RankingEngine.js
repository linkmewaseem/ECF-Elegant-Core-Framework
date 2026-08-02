export class RankingEngine {
  constructor(boosts = {}) {
    this.boosts = new Map(Object.entries(boosts));
  }

  boost(field, weight) {
    this.boosts.set(field, weight);
    return this;
  }

  rank(hits, queryTerm) {
    if (!hits || hits.length === 0) return hits;

    return hits
      .map((item) => {
        let score = item._score || 1;

        for (const [field, weight] of this.boosts.entries()) {
          const val = item[field];
          if (val) {
            if (typeof val === "number") {
              score += val * weight;
            } else if (typeof val === "string" && queryTerm && val.toLowerCase().includes(queryTerm.toLowerCase())) {
              score += 10 * weight;
            }
          }
        }
        return { ...item, _score: score };
      })
      .sort((a, b) => b._score - a._score);
  }
}

export default RankingEngine;
