export class SearchManager {
  constructor(config?: any, container?: any);
  driver(name?: string | null): any;
  capabilities(driverName?: string | null): any;
  extend(name: string, factory: Function): this;
  use(name: string): this;
  index(indexName: string | string[]): SearchQueryBuilder;
  collection(name: string, indexNames?: string[]): SearchQueryBuilder;
  reindex(modelClassOrName: any, items?: any[]): Promise<any>;
  suggest(prefix: string, limit?: number): string[];
  fake(): SearchFake;
}

export class SearchFacade {
  static index(indexName: string | string[]): SearchQueryBuilder;
  static collection(name: string, indexNames?: string[]): SearchQueryBuilder;
  static dsl(dslObj: any): SearchQueryBuilder;
  static reindex(modelClassOrName: any, items?: any[]): Promise<any>;
  static extend(name: string, factory: Function): SearchManager;
  static use(name: string): SearchManager;
  static capabilities(driverName?: string | null): any;
  static suggest(prefix: string, limit?: number): string[];
  static fake(): SearchFake;
}

export const Search: typeof SearchFacade;

export class SearchQueryBuilder {
  query(term: string): this;
  dsl(dslObj: any): this;
  where(field: string, opOrVal: any, val?: any): this;
  whereIn(field: string, values: any[]): this;
  whereRange(field: string, min?: number, max?: number): this;
  facet(fields: string | string[]): this;
  aggregate(field: string, type?: string): this;
  boost(field: string, weight: number): this;
  sortBy(field: string, direction?: string): this;
  take(limit: number): this;
  skip(offset: number): this;
  highlight(fields: string | string[]): this;
  synonyms(synonymMap: any): this;
  withCache(ttlInSeconds?: number): this;
  get(): Promise<any>;
  paginate(page?: number, perPage?: number): Promise<any>;
  suggest(limit?: number): string[];
}

export class SearchFake {
  assertSearched(termFilter: any, callback?: Function | null): boolean;
  assertNothingSearched(): boolean;
  assertIndexed(indexName: string, documentId?: any): boolean;
  assertRemoved(indexName: string, documentId?: any): boolean;
  assertDriver(expectedDriver: string): boolean;
  reset(): void;
}

export const Searchable: any;
