import { ILogManager, ILogDriver, ILogFormatter, ILogProcessor, ILogMasker } from '@ecfjs/contracts';

export type LogLevel = 'emergency' | 'alert' | 'critical' | 'error' | 'warning' | 'notice' | 'info' | 'debug' | 'trace';

export interface LogRecord {
  timestamp: number;
  level: LogLevel;
  message: any;
  channel: string;
  context?: Record<string, any>;
  traceId?: string | null;
  correlationId?: string | null;
  exception?: Record<string, any>;
}

export class LogChannel {
  name: string;
  log(level: LogLevel, message: any, context?: Record<string, any>): Promise<LogRecord | null>;
  emergency(message: any, context?: Record<string, any>): Promise<LogRecord | null>;
  alert(message: any, context?: Record<string, any>): Promise<LogRecord | null>;
  critical(message: any, context?: Record<string, any>): Promise<LogRecord | null>;
  error(message: any, context?: Record<string, any>): Promise<LogRecord | null>;
  warning(message: any, context?: Record<string, any>): Promise<LogRecord | null>;
  notice(message: any, context?: Record<string, any>): Promise<LogRecord | null>;
  info(message: any, context?: Record<string, any>): Promise<LogRecord | null>;
  debug(message: any, context?: Record<string, any>): Promise<LogRecord | null>;
  trace(message: any, context?: Record<string, any>): Promise<LogRecord | null>;
  withContext(context: Record<string, any> | (() => Record<string, any>)): LogChannel;
  batch(): any;
}

export class LogFake {
  assertLogged(level: LogLevel, callbackOrMessage?: any): void;
  assertNothingLogged(): void;
  assertLevel(level: LogLevel, expectedCount?: number): void;
  assertChannel(channelName: string, expectedCount?: number): void;
  assertContext(key: string, value: any): void;
  assertMessage(substring: string): void;
  assertCount(expectedCount: number): void;
  assertMasked(key: string): void;
}

export class LogManager extends ILogManager {
  channel(name?: string | null): LogChannel;
  stack(channelNames: string[]): LogChannel;
  extend(name: string, factory: Function): this;
  use(name: string): LogChannel;
  withContext(context: any, callback?: Function): any;
  sample(rate: number): this;
  search(query: string): Promise<any[]>;
  searchTrace(traceId: string): Promise<any[]>;
  fake(): LogFake;

  emergency(message: any, context?: Record<string, any>): Promise<LogRecord | null>;
  alert(message: any, context?: Record<string, any>): Promise<LogRecord | null>;
  critical(message: any, context?: Record<string, any>): Promise<LogRecord | null>;
  error(message: any, context?: Record<string, any>): Promise<LogRecord | null>;
  warning(message: any, context?: Record<string, any>): Promise<LogRecord | null>;
  notice(message: any, context?: Record<string, any>): Promise<LogRecord | null>;
  info(message: any, context?: Record<string, any>): Promise<LogRecord | null>;
  debug(message: any, context?: Record<string, any>): Promise<LogRecord | null>;
  trace(message: any, context?: Record<string, any>): Promise<LogRecord | null>;
}

export const Log: LogManager;
export const LogFacade: LogManager;
export default LogFacade;
