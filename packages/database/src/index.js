export { default as DatabaseManager } from "./DatabaseManager.js";
export { default as ConnectionManager } from "./ConnectionManager.js";
export { default as Connection } from "./Connection.js";
export { default as Driver } from "./Driver.js";

// Contracts
export { default as IGrammarCompiler } from "./contracts/IGrammarCompiler.js";
export { default as IQueryCache } from "./contracts/IQueryCache.js";
export { default as ICacheStore } from "./contracts/ICacheStore.js";
export { default as IProfiler } from "./contracts/IProfiler.js";
export { default as IMetrics } from "./contracts/IMetrics.js";
export { default as IBulkExecutor } from "./contracts/IBulkExecutor.js";
export { default as ICursorPaginator } from "./contracts/ICursorPaginator.js";
export { default as IExplainEngine } from "./contracts/IExplainEngine.js";
export { default as IHydrator } from "./contracts/IHydrator.js";

// Query & Grammars
export { default as QueryBuilder } from "./query/QueryBuilder.js";
export { default as Expression, isExpression } from "./query/Expression.js";
export { WhereClause, OrderClause, JoinClause, AggregateClause } from "./query/Clause.js";
export { default as Grammar } from "./query/Grammar.js";
export { default as SQLiteGrammar } from "./query/grammars/SQLiteGrammar.js";
export { default as MySQLGrammar } from "./query/grammars/MySQLGrammar.js";
export { default as PostgreSQLGrammar } from "./query/grammars/PostgreSQLGrammar.js";
export { default as MSSQLGrammar } from "./query/grammars/MSSQLGrammar.js";

// Cache & Performance Infrastructure
export { default as QueryCache } from "./query/cache/QueryCache.js";
export { default as MemoryCacheStore } from "./query/cache/stores/MemoryCacheStore.js";
export { default as RedisCacheStore } from "./query/cache/stores/RedisCacheStore.js";
export { default as FileCacheStore } from "./query/cache/stores/FileCacheStore.js";
export { default as CustomCacheStore } from "./query/cache/stores/CustomCacheStore.js";
export { default as CompiledSqlCache } from "./query/cache/CompiledSqlCache.js";
export { default as PreparedStatementCache } from "./query/cache/PreparedStatementCache.js";

// Profiler & Telemetry Metrics
export { default as QueryProfiler } from "./profiler/QueryProfiler.js";
export { default as QueryEventStream } from "./profiler/QueryEventStream.js";
export { default as QueryMetrics } from "./profiler/QueryMetrics.js";

// Enterprise Query Extensions
export { default as BulkOperations } from "./query/BulkOperations.js";
export { default as CursorPagination } from "./query/CursorPagination.js";
export { default as ExplainEngine } from "./query/ExplainEngine.js";

// Drivers
export { default as SQLiteDriver } from "./drivers/SQLiteDriver.js";
export { default as MySQLDriver } from "./drivers/MySQLDriver.js";
export { default as PostgreSQLDriver } from "./drivers/PostgreSQLDriver.js";

// Service Provider & Facades
export { default as DatabaseServiceProvider } from "./providers/DatabaseServiceProvider.js";
export { default as DB } from "./facades/DB.js";
export { default as Schema } from "./facades/Schema.js";

// Schema Builder & DDL Grammars
export { default as SchemaBuilder } from "./schema/SchemaBuilder.js";
export { default as Blueprint } from "./schema/Blueprint.js";
export { default as ColumnDefinition } from "./schema/ColumnDefinition.js";
export { default as ForeignIdColumnDefinition } from "./schema/ForeignIdColumnDefinition.js";
export { default as CompiledStatement } from "./schema/CompiledStatement.js";
export { default as NamingStrategy } from "./schema/NamingStrategy.js";
export {
    SchemaOperation,
    Command,
    CreateTableCommand,
    AddColumnCommand,
    DropColumnCommand,
    RenameColumnCommand,
    AddIndexCommand,
    DropIndexCommand,
    AddForeignKeyCommand,
    DropForeignKeyCommand
} from "./schema/Command.js";

export { default as SchemaGrammar } from "./schema/grammars/SchemaGrammar.js";
export { default as SQLiteSchemaGrammar } from "./schema/grammars/SQLiteSchemaGrammar.js";
export { default as MySQLSchemaGrammar } from "./schema/grammars/MySQLSchemaGrammar.js";
export { default as PostgreSQLSchemaGrammar } from "./schema/grammars/PostgreSQLSchemaGrammar.js";

// Migration System
export { default as Migration } from "./migrations/Migration.js";
export { default as MigrationRepository } from "./migrations/MigrationRepository.js";
export { default as MigrationLoader } from "./migrations/MigrationLoader.js";
export { default as Migrator } from "./migrations/Migrator.js";
export { default as MigrationCreator } from "./migrations/MigrationCreator.js";

// ORM & Model Layer
export { default as Model } from "./orm/Model.js";
export { default as ModelRepository } from "./orm/ModelRepository.js";
export { default as AttributeManager } from "./orm/AttributeManager.js";
export { default as Hydrator } from "./orm/Hydrator.js";
export { default as RelationCache } from "./orm/relations/RelationCache.js";
export { default as PluginManager } from "./orm/PluginManager.js";
export { default as Plugin } from "./orm/extensions/Plugin.js";
export { default as PluginContext } from "./orm/extensions/PluginContext.js";
export { default as PluginStorage } from "./orm/extensions/PluginStorage.js";
export { default as PluginManifest } from "./orm/extensions/PluginManifest.js";
export { default as CastManager } from "./orm/CastManager.js";
export { default as ModelCollection } from "./orm/ModelCollection.js";
export * from "./orm/casts/index.js";
export * from "./orm/relations/index.js";
export * from "./orm/loader/index.js";

// Exceptions
export {
    DatabaseException,
    ConnectionException,
    QueryException,
    TransactionException
} from "./exceptions/DatabaseExceptions.js";
