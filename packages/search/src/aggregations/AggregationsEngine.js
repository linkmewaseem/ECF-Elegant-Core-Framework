export class AggregationsEngine {
  static compute(hits, aggregationsSpecs = []) {
    if (!hits || aggregationsSpecs.length === 0) return {};

    const results = {};

    for (const spec of aggregationsSpecs) {
      const { field, type } = spec;
      const values = hits.map((h) => Number(h[field])).filter((v) => !isNaN(v));

      if (values.length === 0) {
        results[`${field}_${type}`] = null;
        continue;
      }

      switch (type) {
        case "avg":
          results[`${field}_avg`] = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case "max":
          results[`${field}_max`] = Math.max(...values);
          break;
        case "min":
          results[`${field}_min`] = Math.min(...values);
          break;
        case "sum":
          results[`${field}_sum`] = values.reduce((a, b) => a + b, 0);
          break;
        case "count":
          results[`${field}_count`] = values.length;
          break;
        default:
          break;
      }
    }

    return results;
  }
}

export default AggregationsEngine;
