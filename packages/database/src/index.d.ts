export class Expression {
    constructor(value: any);
    getValue(): string;
    toString(): string;
    static isExpression(value: any): boolean;
}

export function isExpression(value: any): boolean;

export class WhereClause {
    type: string;
    column: any;
    operator: string;
    value: any;
    boolean: string;
    not: boolean;
}

export class OrderClause {
    column: string;
    direction: string;
}

export class JoinClause {
    type: string;
    table: string;
    first: string;
    operator: string;
    second: string;
}

export class AggregateClause {
    type: string;
    column: string;
}

export class Grammar {
    wrap(value: any): string;
    compileSelect(ast: any): { sql: string; bindings: any[] };
    compileInsert(ast: any, values: any): { sql: string; bindings: any[] };
    compileUpdate(ast: any, values: any): { sql: string; bindings: any[] };
    compileDelete(ast: any): { sql: string; bindings: any[] };
    compileTruncate(ast: any): { sql: string; bindings: any[] };
    compileWheres(wheres: any[]): { sql: string; bindings: any[] };
}

export class SQLiteGrammar extends Grammar {}
export class MySQLGrammar extends Grammar {}
export class PostgreSQLGrammar extends Grammar {}

export class Driver {
    constructor(config?: any);
    connected: boolean;
    supports: { transactions: boolean; returning: boolean; json: boolean; savepoints: boolean };
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(sql: string, bindings?: any[]): Promise<any>;
    execute(sql: string, bindings?: any[]): Promise<any>;
    beginTransaction(): Promise<any>;
    commit(): Promise<any>;
    rollback(): Promise<any>;
    ping(): Promise<boolean>;
    escapeIdentifier(identifier: string): string;
    quote(value: any): string;
}

export class SQLiteDriver extends Driver {}
export class MySQLDriver extends Driver {}
export class PostgreSQLDriver extends Driver {}

export class QueryBuilder {
    constructor(connection: Connection, grammar?: Grammar);
    connection: Connection;
    grammar: Grammar;
    ast: any;
    clone(): QueryBuilder;
    from(table: string): QueryBuilder;
    table(table: string): QueryBuilder;
    select(...columns: any[]): QueryBuilder;
    addSelect(...columns: any[]): QueryBuilder;
    where(column: any, operator?: any, value?: any, boolean?: string): QueryBuilder;
    orWhere(column: any, operator?: any, value?: any): QueryBuilder;
    whereIn(column: string, values: any[], boolean?: string, not?: boolean): QueryBuilder;
    whereNotIn(column: string, values: any[]): QueryBuilder;
    whereNull(column: string, boolean?: string, not?: boolean): QueryBuilder;
    whereNotNull(column: string): QueryBuilder;
    whereBetween(column: string, range: [any, any], boolean?: string, not?: boolean): QueryBuilder;
    whereRaw(sql: string | Expression, bindings?: any[], boolean?: string): QueryBuilder;
    join(table: string, first: string, operator?: string, second?: string, type?: string): QueryBuilder;
    leftJoin(table: string, first: string, operator?: string, second?: string): QueryBuilder;
    rightJoin(table: string, first: string, operator?: string, second?: string): QueryBuilder;
    orderBy(column: string, direction?: string): QueryBuilder;
    limit(value: number): QueryBuilder;
    offset(value: number): QueryBuilder;
    toSql(): { sql: string; bindings: any[] };
    get(): Promise<any[]>;
    first(): Promise<any>;
    pluck(column: string): Promise<any[]>;
    exists(): Promise<boolean>;
    count(column?: string): Promise<number>;
    max(column: string): Promise<number | null>;
    min(column: string): Promise<number | null>;
    avg(column: string): Promise<number | null>;
    sum(column: string): Promise<number | null>;
    insert(values: any): Promise<any>;
    insertGetId(values: any): Promise<any>;
    update(values: any): Promise<number>;
    delete(): Promise<number>;
    truncate(): Promise<any>;
    macro(name: string, fn: Function): this;
    static macro(name: string, fn: Function): void;
    [key: string]: any;
}

export class ColumnDefinition {
    type: string;
    name: string;
    parameters: any;
    attributes: Record<string, any>;
    constructor(type: string, name: string, parameters?: any);
    get(key: string, defaultValue?: any): any;
    set(key: string, value: any): this;
    nullable(value?: boolean): this;
    notNull(): this;
    notNullable(): this;
    default(value: any): this;
    unsigned(value?: boolean): this;
    unique(indexName?: string): this;
    primary(value?: boolean): this;
    autoIncrement(value?: boolean): this;
    comment(commentText: string): this;
    after(columnName: string): this;
    first(value?: boolean): this;
    charset(charset: string): this;
    collation(collation: string): this;
    useCurrent(): this;
    useCurrentOnUpdate(): this;
    index(indexName?: string): this;
}

export class ForeignIdColumnDefinition extends ColumnDefinition {
    constrained(table?: string, column?: string, indexName?: string): this;
    onDelete(action: string): this;
    onUpdate(action: string): this;
    cascadeOnDelete(): this;
    nullOnDelete(): this;
    restrictOnDelete(): this;
    cascadeOnUpdate(): this;
}

export class Command {
    name: string;
    parameters: any;
    constructor(name: string, parameters?: any);
}

export class CreateTableCommand extends Command {}
export class AddColumnCommand extends Command { column: ColumnDefinition }
export class DropColumnCommand extends Command { columns: string[] }
export class RenameColumnCommand extends Command { from: string; to: string }
export class AddIndexCommand extends Command { type: string; columns: string[]; indexName: string }
export class DropIndexCommand extends Command { type: string; indexName: string }
export class AddForeignKeyCommand extends Command {
    columns: string[];
    foreignKeyName: string;
    referencesColumns: string[];
    onTable: string;
    onDeleteAction: string;
    onUpdateAction: string;
    references(columns: string | string[]): this;
    on(table: string): this;
    onDelete(action: string): this;
    onUpdate(action: string): this;
}
export class DropForeignKeyCommand extends Command { foreignKeyName: string }

export class Blueprint {
    table: string;
    creating: boolean;
    columns: ColumnDefinition[];
    commands: Command[];
    constructor(table: string, callback?: (table: Blueprint) => void);
    create(): this;
    addColumn(type: string, name: string, parameters?: any): ColumnDefinition;
    id(name?: string): ColumnDefinition;
    increments(name?: string): ColumnDefinition;
    bigIncrements(name?: string): ColumnDefinition;
    string(name: string, length?: number): ColumnDefinition;
    text(name: string): ColumnDefinition;
    integer(name: string): ColumnDefinition;
    bigInteger(name: string): ColumnDefinition;
    float(name: string, precision?: number, scale?: number): ColumnDefinition;
    double(name: string, precision?: number, scale?: number): ColumnDefinition;
    decimal(name: string, precision?: number, scale?: number): ColumnDefinition;
    boolean(name: string): ColumnDefinition;
    date(name: string): ColumnDefinition;
    datetime(name: string, precision?: number): ColumnDefinition;
    timestamp(name: string, precision?: number): ColumnDefinition;
    json(name: string): ColumnDefinition;
    uuid(name?: string): ColumnDefinition;
    binary(name: string): ColumnDefinition;
    foreignId(name: string): ForeignIdColumnDefinition;
    timestamps(precision?: number): void;
    softDeletes(column?: string, precision?: number): void;
    rememberToken(): void;
    dropColumn(...columns: (string | string[])[]): Command;
    renameColumn(from: string, to: string): Command;
    index(columns: string | string[], name?: string): Command;
    unique(columns: string | string[], name?: string): Command;
    primary(columns: string | string[], name?: string): Command;
    dropIndex(indexName: string): Command;
    dropUnique(indexName: string): Command;
    dropPrimary(indexName?: string): Command;
    foreign(columns: string | string[], name?: string): AddForeignKeyCommand;
    dropForeign(foreignKeyName: string): Command;
    createIndexName(type: string, columns: string | string[]): string;
    toSql(grammar: SchemaGrammar): string[];
}

export class SchemaGrammar {
    supports: {
        alter: boolean;
        after: boolean;
        first: boolean;
        renameColumn: boolean;
        dropColumn: boolean;
        foreignKeys: boolean;
        json: boolean;
    };
    wrap(value: string): string;
    compile(blueprint: Blueprint): string[];
    compileCreate(blueprint: Blueprint): string[];
    compileTable(blueprint: Blueprint): string[];
    compileRenameTable(from: string, to: string): string;
    compileDropTable(table: string): string;
    compileDropTableIfExists(table: string): string;
    compileHasTable(table: string): { sql: string; bindings: any[] };
    compileHasColumn(table: string, column: string): { sql: string; bindings: any[]; filter?: (rows: any[]) => boolean };
}

export class SQLiteSchemaGrammar extends SchemaGrammar {}
export class MySQLSchemaGrammar extends SchemaGrammar {}
export class PostgreSQLSchemaGrammar extends SchemaGrammar {}

export class SchemaBuilder {
    constructor(connection: Connection, grammar?: SchemaGrammar);
    connection: Connection;
    grammar: SchemaGrammar;
    connection(name: string): SchemaBuilder;
    create(table: string, callback: (table: Blueprint) => void): Promise<void>;
    table(table: string, callback: (table: Blueprint) => void): Promise<void>;
    rename(from: string, to: string): Promise<any>;
    drop(table: string): Promise<any>;
    dropIfExists(table: string): Promise<any>;
    hasTable(table: string): Promise<boolean>;
    hasColumn(table: string, column: string): Promise<boolean>;
}

export class Connection {
    constructor(name: string, driver: Driver, eventDispatcher?: any);
    name: string;
    driver: Driver;
    grammar: Grammar;
    schemaGrammar: SchemaGrammar;
    queryBuilder(): QueryBuilder;
    getSchemaBuilder(): SchemaBuilder;
    table(tableName: string): QueryBuilder;
    isConnected(): boolean;
    inTransaction(): boolean;
    transactionLevel(): number;
    connect(): Promise<this>;
    disconnect(): Promise<void>;
    query(sql: string, bindings?: any[]): Promise<any>;
    execute(sql: string, bindings?: any[]): Promise<any>;
    select(sql: string, bindings?: any[]): Promise<any[]>;
    insert(sql: string, bindings?: any[]): Promise<any>;
    update(sql: string, bindings?: any[]): Promise<any>;
    delete(sql: string, bindings?: any[]): Promise<any>;
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    transaction<T>(callback: (conn: Connection) => Promise<T>): Promise<T>;
}

export class DatabaseManager {
    constructor(connectionManager: ConnectionManager);
    manager: ConnectionManager;
    connection(name?: string): Connection;
    table(tableName: string): QueryBuilder;
    schema(name?: string): SchemaBuilder;
    getSchemaBuilder(name?: string): SchemaBuilder;
    migrator(options?: { connection?: string; table?: string }): Migrator;
    raw(value: any): Expression;
    registerDriver(name: string, DriverClass: any): this;
    query(sql: string, bindings?: any[]): Promise<any>;
    select(sql: string, bindings?: any[]): Promise<any[]>;
    insert(sql: string, bindings?: any[]): Promise<any>;
    update(sql: string, bindings?: any[]): Promise<any>;
    delete(sql: string, bindings?: any[]): Promise<any>;
    transaction<T>(callback: (conn: Connection) => Promise<T>): Promise<T>;
    disconnect(name?: string): Promise<void>;
    disconnectAll(): Promise<void>;
}

export class Migration {
    up(schema: SchemaBuilder): Promise<void>;
    down(schema: SchemaBuilder): Promise<void>;
}

export class MigrationRepository {
    constructor(connection: Connection, table?: string);
    table: string;
    connection: Connection;
    repositoryExists(): Promise<boolean>;
    createRepository(): Promise<void>;
    getRan(): Promise<string[]>;
    getLastBatchNumber(): Promise<number>;
    getNextBatchNumber(): Promise<number>;
    getLast(steps?: number | null): Promise<any[]>;
    log(migration: string, batch: number, module?: string, checksum?: string | null): Promise<any>;
    delete(migration: string): Promise<any>;
}

export class MigrationLoader {
    load(paths: string | string[] | Record<string, any>): Promise<Array<{ name: string; file: string; path: string; instance: any }>>;
    resolveInstance(migrationExport: any): any;
}

export class Migrator {
    constructor(repository: MigrationRepository, connection: Connection, loader?: MigrationLoader);
    repository: MigrationRepository;
    connection: Connection;
    loader: MigrationLoader;
    run(paths: any, options?: { module?: string; checksum?: string }): Promise<{ ran: string[]; batch: number | null }>;
    rollback(paths: any, options?: { steps?: number }): Promise<{ rolledBack: string[] }>;
    reset(paths: any): Promise<{ rolledBack: string[] }>;
    refresh(paths: any, options?: any): Promise<{ rolledBack: string[]; ran: string[]; batch: number | null }>;
    status(paths: any): Promise<Array<{ name: string; ran: boolean; batch: number | null; executed_at: string | null }>>;
}

export class MigrationCreator {
    constructor(customDir?: string | null);
    create(name: string, targetDir?: string | null, options?: { table?: string; create?: boolean }): Promise<{ fileName: string; filePath: string; className: string }>;
}

export const Schema: SchemaBuilder;

export class DatabaseServiceProvider {
    register(app?: any): void;
    boot(app?: any): void;
}

export const DB: DatabaseManager;

export class DatabaseException extends Error {}
export class ConnectionException extends DatabaseException {}
export class QueryException extends DatabaseException {
    sql: string;
    bindings: any[];
}
export class TransactionException extends DatabaseException {}

export class Cast {
    get(value: any, key?: string, attributes?: any): any;
    set(value: any, key?: string, attributes?: any): any;
}

export class IntegerCast extends Cast {}
export class FloatCast extends Cast {}
export class BooleanCast extends Cast {}
export class JsonCast extends Cast {}
export class DateCast extends Cast {}

export class CastManager {
    constructor(model: any);
    getCasts(): Record<string, any>;
    hasCast(key: string): boolean;
    resolveCast(castDefinition: any): Cast | null;
    castGet(key: string, value: any, attributes?: any): any;
    castSet(key: string, value: any, attributes?: any): any;
}

export class ModelCollection<T = any> extends Array<T> {
    static make<T = any>(items?: T | T[]): ModelCollection<T>;
    first(predicate?: (item: T, index: number) => boolean): T | null;
    last(predicate?: (item: T, index: number) => boolean): T | null;
    find(fnOrId: ((item: T, index: number) => boolean) | any): T | null;
    where(key: string, operatorOrValue: any, value?: any): ModelCollection<T>;
    pluck(key: string, keyBy?: string | null): any;
    groupBy(keyOrFn: string | ((item: T, index: number) => any)): Record<string, ModelCollection<T>>;
    keyBy(keyOrFn: string | ((item: T, index: number) => any)): Record<string, T>;
    chunk(size: number): ModelCollection<ModelCollection<T>>;
    sum(keyOrFn?: string | ((item: T, index: number) => number) | null): number;
    avg(keyOrFn?: string | ((item: T, index: number) => number) | null): number;
    map<U>(fn: (item: T, index: number, array: T[]) => U): ModelCollection<U>;
    filter(fn: (item: T, index: number, array: T[]) => boolean): ModelCollection<T>;
    reject(fn: (item: T, index: number) => boolean): ModelCollection<T>;
    sortBy(keyOrFn: string | ((item: T) => any), direction?: "asc" | "desc"): ModelCollection<T>;
    unique(keyOrFn?: string | ((item: T, index: number) => any) | null): ModelCollection<T>;
    partition(fn: (item: T, index: number) => boolean): [ModelCollection<T>, ModelCollection<T>];
    tap(callback: (collection: this) => void): this;
    pipe<R>(callback: (collection: this) => R): R;
    when(condition: any, callback: (collection: this, cond: any) => any, defaultCallback?: (collection: this, cond: any) => any): any;
    unless(condition: any, callback: (collection: this, cond: any) => any, defaultCallback?: (collection: this, cond: any) => any): any;
    toJSON(): any[];
    toArray(): T[];
}

export class Model {
    static table: string | null;
    static connection: string | null;
    static primaryKey: string;
    static keyType: string;
    static incrementing: boolean;
    static fillable: string[];
    static guarded: string[];
    static casts: Record<string, any>;
    static hidden: string[];
    static visible: string[];
    static appends: string[];

    constructor(attributes?: Record<string, any>, force?: boolean);
    getAttributeManager(): AttributeManager;
    getAttribute(key: string, defaultValue?: any): any;
    setAttribute(key: string, value: any): this;
    fill(attributes: Record<string, any>): this;
    forceFill(attributes: Record<string, any>): this;
    isDirty(key?: string | null): boolean;
    isClean(key?: string | null): boolean;
    getOriginal(key?: string | null, defaultValue?: any): any;
    getChanges(): Record<string, any>;
    save(): Promise<this>;
    delete(): Promise<boolean>;
    refresh(): Promise<this>;
    toJSON(): Record<string, any>;
    toArray(): Record<string, any>;

    hasOne(relatedClass: typeof Model, foreignKey?: string | null, localKey?: string | null): HasOne;
    hasMany(relatedClass: typeof Model, foreignKey?: string | null, localKey?: string | null): HasMany;
    belongsTo(relatedClass: typeof Model, foreignKey?: string | null, ownerKey?: string | null): BelongsTo;
    belongsToMany(
        relatedClass: typeof Model,
        table?: string | null,
        foreignPivotKey?: string | null,
        relatedPivotKey?: string | null,
        parentKey?: string | null,
        relatedKey?: string | null
    ): BelongsToMany;

    static repository(): ModelRepository;
    static query(): QueryBuilder;
    static where(field: string, operator?: any, value?: any): QueryBuilder;
    static all(): Promise<ModelCollection>;
    static find(id: any): Promise<Model | null>;
    static findOrFail(id: any): Promise<Model>;
    static make(attributes?: Record<string, any>): Model;
    static create(attributes?: Record<string, any>): Promise<Model>;
    static use(plugin: any, options?: Record<string, any>): typeof Model;
    static on(event: string, callback: Function): typeof Model;
    [key: string]: any;
}

export class Relation {
    parent: Model;
    related: typeof Model;
    builder: QueryBuilder;
    meta: {
        type: string;
        parentModel: typeof Model;
        relatedModel: typeof Model;
        foreignKey: string | null;
        localKey: string | null;
        pivotTable: string | null;
        foreignPivotKey: string | null;
        relatedPivotKey: string | null;
        inverse: boolean;
    };
    constructor(parent: Model, related: typeof Model);
    where(column: any, operator?: any, value?: any, boolean?: string): this;
    orWhere(column: any, operator?: any, value?: any): this;
    whereIn(column: string, values: any[], boolean?: string, not?: boolean): this;
    whereNotIn(column: string, values: any[]): this;
    whereNull(column: string, boolean?: string, not?: boolean): this;
    whereNotNull(column: string): this;
    orderBy(column: string, direction?: string): this;
    latest(column?: string): this;
    oldest(column?: string): this;
    defaultOrder(column: string, direction?: string): this;
    limit(value: number): this;
    offset(value: number): this;
    select(...columns: any[]): this;
    join(table: string, first: string, operator?: string, second?: string, type?: string): this;
    leftJoin(table: string, first: string, operator?: string, second?: string): this;
    rightJoin(table: string, first: string, operator?: string, second?: string): this;
    cache(): this;
    get(): Promise<ModelCollection>;
    first(): Promise<Model | null>;
    count(column?: string): Promise<number>;
    exists(): Promise<boolean>;
    getResults(): Promise<any>;
    then(resolve: (value: any) => any, reject?: (reason: any) => any): Promise<any>;
}

export class HasOne extends Relation {}
export class HasMany extends Relation {}
export class BelongsTo extends Relation {}
export class BelongsToMany extends Relation {}

export class AttributeManager {
    constructor(model: any, attributes?: Record<string, any>, force?: boolean);
    getAttribute(key: string, defaultValue?: any): any;
    setAttribute(key: string, value: any): this;
    fill(attributes?: Record<string, any>): this;
    forceFill(attributes?: Record<string, any>): this;
    isFillable(key: string, fillable?: string[], guarded?: string[]): boolean;
    isDirty(key?: string | null): boolean;
    isClean(key?: string | null): boolean;
    getOriginal(key?: string | null, defaultValue?: any): any;
    getChanges(): Record<string, any>;
    getRawAttributes(): Record<string, any>;
    syncOriginal(): this;
    setRelation(key: string, value: any): this;
    getRelation(key: string, defaultValue?: any): any;
    hasRelation(key: string): boolean;
    clearRelationCache(): this;
    toObject(): Record<string, any>;
}

export class ModelRepository {
    constructor(modelClass: typeof Model, connection?: Connection | null);
    modelClass: typeof Model;
    getConnection(): Connection;
    getTable(): string;
    getPrimaryKey(): string;
    query(): QueryBuilder;
    where(field: string, operator?: any, value?: any): QueryBuilder;
    all(): Promise<ModelCollection>;
    find(id: any): Promise<Model | null>;
    findOrFail(id: any): Promise<Model>;
    create(attributes?: Record<string, any>): Promise<Model>;
    save(model: Model): Promise<Model>;
    delete(model: Model): Promise<boolean>;
    instantiateModel(row: any): Model;
}



