export class Job {
  data: any;
  queue: string;
  connection: string | null;
  delaySeconds: number;
  tries: number;
  timeout: number;
  cancelled: boolean;

  onQueue(queue: string): this;
  onConnection(connection: string): this;
  delay(seconds: number): this;
  setTries(count: number): this;
  cancel(): this;
  tags(): string[];
  middleware(): any[];
  handle(): Promise<any>;

  static dispatch(...args: any[]): Promise<any>;
  static dispatchSync(...args: any[]): Promise<any>;
}

export class JobSerializer {
  serialize(jobInstance: any, options?: any): any;
  deserialize(payload: any): any;
}

export class JobChain {
  static dispatch(jobs?: Job[]): Promise<boolean>;
}

export class JobBatch {
  id: string;
  static dispatch(jobs?: Job[]): JobBatch;
  then(callback: Function): this;
  catch(callback: Function): this;
}

export class JobMetrics {
  recordQueued(): void;
  recordProcessed(durationMs: number): void;
  recordFailed(): void;
  recordRetried(): void;
  getAverageLatency(): number;
  snapshot(): any;
}

export class QueueException extends Error {
  status: number;
  code: string;
}

export class SyncDriver {}
export class MemoryDriver {}

export class Worker {
  runNextJob(queues?: string[]): Promise<boolean>;
  daemon(queues?: string[], intervalMs?: number): Promise<void>;
  stop(): void;
}

export class WorkerSupervisor {
  start(queues?: string[]): Promise<void>;
  pause(): void;
  resume(queues?: string[]): void;
  terminate(): void;
}

export class FailedJobRepository {
  log(connection: string, queue: string, payload: any, exception: any): Promise<string>;
  all(): Promise<any[]>;
  find(id: string): Promise<any>;
  forget(id: string): Promise<boolean>;
  flush(): Promise<boolean>;
}

export class QueueTestingFake {
  assertPushed(jobClass: any): void;
  assertPushedOn(queue: string, jobClass: any): void;
  assertNotPushed(jobClass: any): void;
}

export class QueueServiceProvider {
  register(app: any): void;
  boot(app: any): void;
}

export const Queue: any;
