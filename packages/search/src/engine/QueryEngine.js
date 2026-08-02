import AggregationsEngine from "../aggregations/AggregationsEngine.js";
import RankingEngine from "../ranking/RankingEngine.js";

export class QueryEngine {
  constructor(getDriverFn, pipeline, aliasManager) {
    this.getDriverFn = getDriverFn;
    this.pipeline = pipeline;
    this.aliasManager = aliasManager;
  }

  getDriver() {
    return this.getDriverFn();
  }

  async execute(builder) {
    const rawTarget = builder.indexName;
    const targetIndexes = Array.isArray(rawTarget) ? rawTarget : [rawTarget];
    const resolvedIndex = targetIndexes.map((idx) => this.aliasManager.resolveIndex(idx)).join(",");

    const params = {
      term: builder.searchTerm,
      filters: builder.filters,
      facets: builder.facetsSpecs,
      aggregations: builder.aggregationsSpecs,
      boosts: builder.boostsSpecs,
      sort: builder.sortSpecs,
      limit: builder.limitValue,
      offset: builder.offsetValue,
      highlightFields: builder.highlightSpecs,
      synonymsMap: builder.synonymsSpecs,
      dsl: builder.dslSpec,
    };

    const finalSearch = async (queryParams) => {
      const activeDriver = this.getDriver();
      return await activeDriver.search(resolvedIndex, queryParams);
    };

    const result = await this.pipeline.process(params, finalSearch);

    if (builder.boostsSpecs && Object.keys(builder.boostsSpecs).length > 0) {
      const rankingEngine = new RankingEngine(builder.boostsSpecs);
      result.hits = rankingEngine.rank(result.hits, builder.searchTerm);
    }

    if (builder.aggregationsSpecs && builder.aggregationsSpecs.length > 0) {
      result.aggregations = AggregationsEngine.compute(result.hits, builder.aggregationsSpecs);
    }

    return result;
  }
}

export default QueryEngine;
