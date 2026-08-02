import { ServiceProvider } from '@ecf/core';

export abstract class IScheduleTask {
  isDue(date?: Date, timezone?: string | null): boolean;
  run(container?: any): Promise<any>;
  expression(): string;
  name(): string;
}

export class CronParser {
  static isDue(expression: string, date?: Date, timezone?: string | null): boolean;
  static getZonedDate(date: Date, timezone: string): Date;
}

export class ScheduleMutex {
  constructor(cache?: any);
  getMutexKey(taskName: string): string;
  exists(taskName: string): Promise<boolean>;
  lock(taskName: string, expiresInMs?: number): Promise<boolean>;
  unlock(taskName: string): Promise<boolean>;
  clear(): void;
}

export class EventTask extends IScheduleTask {
  constructor(type: string, target: any, args?: any[], name?: string | null);

  cron(expression: string): this;
  everyMinute(): this;
  everyTwoMinutes(): this;
  everyFiveMinutes(): this;
  everyTenMinutes(): this;
  everyFifteenMinutes(): this;
  everyThirtyMinutes(): this;

  hourly(): this;
  hourlyAt(minute: number): this;

  daily(): this;
  dailyAt(timeStr: string): this;

  weekly(): this;
  weeklyOn(dayOfWeek: number | string, timeStr?: string): this;

  monthly(): this;
  monthlyOn(dayOfMonth?: number, timeStr?: string): this;

  yearly(): this;

  sundays(): this;
  mondays(): this;
  tuesdays(): this;
  wednesdays(): this;
  thursdays(): this;
  fridays(): this;
  saturdays(): this;
  at(timeStr: string): this;

  weekdays(): this;
  weekends(): this;
  when(closureOrBool: Function | boolean): this;
  skip(closureOrBool: Function | boolean): this;
  between(start: string, end: string): this;
  unlessBetween(start: string, end: string): this;
  timezone(tz: string): this;

  withoutOverlapping(expiresInMs?: number): this;
  onOneServer(): this;
  runInBackground(): this;

  before(fn: Function): this;
  after(fn: Function): this;
  onSuccess(fn: Function): this;
  onFailure(fn: Function): this;

  isDue(date?: Date, customTz?: string | null): boolean;
  run(container?: any, eventsDispatcher?: any, mutex?: ScheduleMutex | null): Promise<{ status: string; result?: any; reason?: string }>;
  getTimezone(): string | null;
  overlapsAllowed(): boolean;
  isOneServer(): boolean;
  isBackground(): boolean;
}

export class ScheduleManager {
  constructor(container?: any);
  command(commandName: string, args?: any[]): EventTask;
  job(jobTarget: any, args?: any[]): EventTask;
  call(callback: Function, args?: any[]): EventTask;
  getTasks(): EventTask[];
  dueTasks(date?: Date, timezone?: string | null): EventTask[];
  runDue(date?: Date, timezone?: string | null): Promise<Array<{ task: EventTask; status: string; result?: any; reason?: string; error?: Error }>>;
  clear(): this;
  readonly mutex: ScheduleMutex;
}

export class TaskStarted {
  task: EventTask;
  constructor(task: EventTask);
}
export class TaskFinished {
  task: EventTask;
  result: any;
  constructor(task: EventTask, result?: any);
}
export class TaskSkipped {
  task: EventTask;
  reason: string;
  constructor(task: EventTask, reason?: string);
}
export class TaskFailed {
  task: EventTask;
  error: Error;
  constructor(task: EventTask, error: Error);
}

export class ScheduleRunCommand {
  static readonly signature: string;
  static readonly description: string;
  handle(app: any, output?: any): Promise<number>;
}
export class ScheduleListCommand {
  static readonly signature: string;
  static readonly description: string;
  handle(app: any, output?: any): Promise<number>;
}
export class ScheduleTestCommand {
  static readonly signature: string;
  static readonly description: string;
  handle(app: any, options?: any, output?: any): Promise<number>;
}
export class ScheduleClearCacheCommand {
  static readonly signature: string;
  static readonly description: string;
  handle(app: any, output?: any): Promise<number>;
}

export class SchedulerServiceProvider extends ServiceProvider {
  register(app: any): void;
  boot(app: any): void;
}

export const ScheduleFacade: any;
export const Schedule: any;

export class ScheduleFake extends ScheduleManager {
  assertScheduled(nameOrPredicate: string | Function): void;
  assertRan(nameOrPredicate: string | Function): void;
  assertSkipped(nameOrPredicate: string | Function): void;
}
