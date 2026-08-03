export class IAuthManager {
  guard(name?: string | null): any;
  user(): any;
}
export class IGuard {
  user(): any;
  check(): boolean;
}
export class ICacheManager {
  store(name?: string | null): any;
  get(key: string): Promise<any>;
  put(key: string, value: any, ttl?: number): Promise<boolean>;
}
export class IQueueManager {
  push(job: any, data?: any, queue?: string): Promise<any>;
  later(delayInSeconds: number, job: any, data?: any, queue?: string): Promise<any>;
}
export class IMailManager {
  to(recipients: any): any;
  send(mailable: any): Promise<any>;
}
export class INotificationManager {
  send(notifiables: any, notification: any): Promise<any>;
  sendNow(notifiables: any, notification: any, channels?: string[]): Promise<any>;
}
export class IStorageManager {
  disk(name?: string | null): any;
  get(path: string): Promise<any>;
  put(path: string, contents: any): Promise<boolean>;
}
export class IBroadcastManager {
  driver(name?: string | null): any;
  extend(name: string, factory: Function): this;
  channel(pattern: string, callback: Function): this;
  private(name: string): any;
  presence(name: string): any;
  to(channels: any): any;
  broadcast(eventOrChannels: any, eventName?: string | null, payload?: any): Promise<any>;
  fake(): any;
}
export class IBroadcastDriver {
  publish(channel: string, event: string, payload: any, metadata?: any): Promise<any>;
  subscribe(channel: string, callback: Function): Promise<any>;
  unsubscribe(channel: string, callback?: Function): Promise<any>;
  authorize(channel: string, socketId: string, options?: any): Promise<any>;
}
export class IPresenceRepository {
  join(channel: string, user: any): Promise<any>;
  leave(channel: string, userId: any): Promise<any>;
  members(channel: string): Promise<any[]>;
  count(channel: string): Promise<number>;
  exists(channel: string, userId: any): Promise<boolean>;
}
export class ISearchManager {
  driver(name?: string | null): any;
  extend(name: string, factory: Function): this;
  use(name: string): this;
  index(name: string | string[]): any;
  collection(name: string): any;
  reindex(modelClass: any): Promise<any>;
  fake(): any;
}
export class ISearchDriver {
  capabilities(): string[];
  index(indexName: string, documents: any[]): Promise<any>;
  search(indexName: string, params: any): Promise<any>;
  remove(indexName: string, documentIds: any[]): Promise<any>;
  flush(indexName: string): Promise<any>;
}
export class IApiManager {
  resource(data: any, resourceClass?: any): any;
  collection(data: any, resourceClass?: any): any;
  version(version: string): this;
  profile(name: string): this;
  fake(): any;
}
export class IApiResource {
  toArray(): any;
  when(condition: any, value: any, defaultValue?: any): any;
  merge(data: any): any;
  mergeWhen(condition: any, data: any): any;
  whenLoaded(relationship: string, value?: any, defaultValue?: any): any;
  whenCounted(relationship: string, value?: any, defaultValue?: any): any;
}
export class ILogManager {
  channel(name?: string | null): any;
  stack(channels: string[]): any;
  withContext(context: any, callback?: Function): any;
  child(context: any): any;
  batch(): any;
  fake(): any;
}
export class ILogDriver {
  write(record: any): Promise<any>;
  getCapabilities(): any;
}
export class ITestRunner {
  test(name: string, fn: Function): any;
  profile(name: string): this;
}
export class ITestHttpClient {
  get(url: string, headers?: any): Promise<any>;
  post(url: string, data?: any, headers?: any): Promise<any>;
  actingAs(user: any): this;
}
export class ITestDatabase {
  useTransaction(): Promise<any>;
  refresh(): Promise<any>;
  assertDatabaseHas(table: string, data: any): void;
}
export class IDevKitManager {
  make(generatorName: string, options?: any): Promise<any>;
  blueprint(yamlFile: string): Promise<any>;
  install(packageName: string): Promise<any>;
  doctor(): Promise<any>;
}
export class ICodeGenerator {
  generate(options?: any): Promise<any>;
}
export class IAiManager {
  chat(prompt: string, options?: any): Promise<any>;
  stream(prompt: string, options?: any): AsyncIterable<string>;
  embed(text: string, options?: any): Promise<number[]>;
  memory(conversationId: string): any;
  prompt(name: string, variables?: any): any;
  agent(options?: any): any;
  rag(options?: any): any;
  mcp(serverName: string): any;
}
export class IAiDriver {
  chat(prompt: string, options?: any): Promise<any>;
  embed(text: string, options?: any): Promise<number[]>;
  getCapabilities(): Record<string, boolean>;
}
export class IConversationMemory {
  add(role: string, content: string): void;
  getHistory(): Array<{ role: string; content: string }>;
  clear(): void;
}

export class IASTInjector {
  inject(ast: any, node: any): any;
  parse(source: string): any;
}

export class IArchitectureValidator {
  validate(project: any): Promise<any>;
  rules(): any[];
}

export class ILogFormatter {
  format(record: any): string;
}

export class ILogProcessor {
  process(record: any): any;
}

export class ILogMasker {
  mask(value: string, key?: string): string;
}
