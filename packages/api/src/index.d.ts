export class ApiManager {
  constructor(config?: any, container?: any);
  resource(data: any, resourceClass?: any): ApiResource;
  collection(data: any, resourceClass?: any): ResourceCollection;
  version(ver: string): this;
  profile(name: string): this;
  ok(data?: any, headers?: any): any;
  created(data?: any, headers?: any): any;
  accepted(data?: any, headers?: any): any;
  noContent(headers?: any): any;
  error(message?: string, status?: number, details?: any): any;
  validation(errors?: any, message?: string): any;
  notFound(message?: string): any;
  unauthorized(message?: string): any;
  forbidden(message?: string): any;
  fake(): ApiFake;
}

export class ApiFacade {
  static resource(data: any, resourceClass?: any): ApiResource;
  static collection(data: any, resourceClass?: any): ResourceCollection;
  static version(ver: string): ApiManager;
  static profile(name: string): ApiManager;
  static ok(data?: any, headers?: any): any;
  static created(data?: any, headers?: any): any;
  static accepted(data?: any, headers?: any): any;
  static noContent(headers?: any): any;
  static error(message?: string, status?: number, details?: any): any;
  static validation(errors?: any, message?: string): any;
  static notFound(message?: string): any;
  static unauthorized(message?: string): any;
  static forbidden(message?: string): any;
  static fake(): ApiFake;
}

export const Api: typeof ApiFacade;

export class ApiResource {
  constructor(resource: any);
  static make(resource: any): ApiResource;
  static collection(resources: any[]): ResourceCollection;
  when(condition: any, value: any, defaultValue?: any): any;
  merge(data: any): any;
  mergeWhen(condition: any, data: any): any;
  whenLoaded(relationship: string, value?: any, defaultValue?: any): any;
  whenCounted(relationship: string, value?: any, defaultValue?: any): any;
  resolve(options?: any): any;
  toArray(): any;
}

export class ResourceCollection {
  constructor(collection: any[], resourceClass?: any);
  setPagination(meta: any): this;
  resolve(options?: any): any;
}

export class ApiFake {
  recordCall(path: string, method: string, status: number, responseBody?: any, headers?: any, meta?: any): any;
  assertCalled(pathFilter: any): boolean;
  assertStatus(expectedStatus: number): boolean;
  assertRateLimited(): boolean;
  assertVersion(expectedVersion: string): boolean;
  assertProblem(): boolean;
  assertPaginated(): boolean;
  reset(): void;
}
