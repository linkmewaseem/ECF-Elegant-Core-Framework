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
