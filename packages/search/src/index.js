export { SearchManager } from "./SearchManager.js";
export { SearchFacade, Search } from "./facades/Search.js";
export { SearchServiceProvider } from "./providers/SearchServiceProvider.js";

export { SearchEngine } from "./engine/SearchEngine.js";
export { Indexer } from "./engine/Indexer.js";
export { QueryEngine } from "./engine/QueryEngine.js";
export { IndexAliasManager } from "./aliases/IndexAliasManager.js";

export { DriverRegistry } from "./drivers/DriverRegistry.js";
export { MemoryDriver } from "./drivers/MemoryDriver.js";
export { NullDriver } from "./drivers/NullDriver.js";
export { DatabaseDriver } from "./drivers/DatabaseDriver.js";
export { MeilisearchDriver } from "./drivers/MeilisearchDriver.js";
export { TypesenseDriver } from "./drivers/TypesenseDriver.js";
export { ElasticDriver } from "./drivers/ElasticDriver.js";

export { DriverCapabilities } from "./capabilities/DriverCapabilities.js";

export { SearchPipeline } from "./pipeline/SearchPipeline.js";
export { NormalizeStage } from "./pipeline/stages/NormalizeStage.js";
export { TokenizerStage } from "./pipeline/stages/TokenizerStage.js";
export { SynonymStage } from "./pipeline/stages/SynonymStage.js";
export { HighlightStage } from "./pipeline/stages/HighlightStage.js";

export { RankingEngine } from "./ranking/RankingEngine.js";
export { AggregationsEngine } from "./aggregations/AggregationsEngine.js";
export { SuggestionsEngine } from "./suggestions/SuggestionsEngine.js";

export { SearchQueryBuilder } from "./builder/SearchQueryBuilder.js";
export { SearchResult } from "./results/SearchResult.js";

export { Searchable } from "./traits/Searchable.js";
export { SearchCacheManager } from "./cache/SearchCacheManager.js";

export { ImportSearchableJob } from "./jobs/ImportSearchableJob.js";
export { RemoveSearchableJob } from "./jobs/RemoveSearchableJob.js";
export { ReindexBatchJob } from "./jobs/ReindexBatchJob.js";

export { SearchFake } from "./testing/SearchFake.js";

export * from "./events/SearchEvents.js";
export * from "./contracts/ai/AIContracts.js";
