import { IScheduleTask } from '../contracts/IScheduleTask.js';
import { CronParser } from './CronParser.js';

/**
 * EventTask — Fluent builder and runner for scheduled tasks (commands, jobs, closures).
 */
export class EventTask extends IScheduleTask {
  #task; // { type: 'command'|'job'|'callback', target: string|object|function, args: any[] }
  #taskName;
  #cronExpression = '* * * * *';
  #tz = null;
  #filters = [];
  #rejects = [];
  #timeBetween = null; // { start: '09:00', end: '18:00', unless: false }
  #daysConstraint = null; // 'weekdays' | 'weekends'
  #overlapsAllowed = true;
  #overlapExpiresMs = 86400000;
  #oneServer = false;
  #inBackground = false;

  #beforeCallbacks = [];
  #afterCallbacks = [];
  #successCallbacks = [];
  #failureCallbacks = [];

  constructor(type, target, args = [], name = null) {
    super();
    this.#task = { type, target, args };
    this.#taskName = name ?? EventTask.resolveName(type, target);
  }

  static resolveName(type, target) {
    if (type === 'command') return `command: ${target}`;
    if (type === 'job') return `job: ${target.name ?? target.constructor?.name ?? 'Job'}`;
    if (type === 'callback') return `callback: ${target.name || 'anonymous'}`;
    return 'scheduled-task';
  }

  // ─── Frequencies ─────────────────────────────────────────────────────────

  cron(expression) {
    this.#cronExpression = expression;
    return this;
  }

  everyMinute() { return this.cron('* * * * *'); }
  everyTwoMinutes() { return this.cron('*/2 * * * *'); }
  everyFiveMinutes() { return this.cron('*/5 * * * *'); }
  everyTenMinutes() { return this.cron('*/10 * * * *'); }
  everyFifteenMinutes() { return this.cron('*/15 * * * *'); }
  everyThirtyMinutes() { return this.cron('*/30 * * * *'); }

  hourly() { return this.cron('0 * * * *'); }
  hourlyAt(minute) { return this.cron(`${minute} * * * *`); }

  daily() { return this.cron('0 0 * * *'); }
  dailyAt(timeStr) {
    const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
    return this.cron(`${m ?? 0} ${h ?? 0} * * *`);
  }

  weekly() { return this.cron('0 0 * * 0'); }
  weeklyOn(dayOfWeek, timeStr = '00:00') {
    const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
    const dow = typeof dayOfWeek === 'number' ? dayOfWeek : EventTask.dayNameToNumber(dayOfWeek);
    return this.cron(`${m ?? 0} ${h ?? 0} * * ${dow}`);
  }

  monthly() { return this.cron('0 0 1 * *'); }
  monthlyOn(dayOfMonth = 1, timeStr = '00:00') {
    const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
    return this.cron(`${m ?? 0} ${h ?? 0} ${dayOfMonth} * *`);
  }

  yearly() { return this.cron('0 0 1 1 *'); }

  sundays() { return this.cronDays(0); }
  mondays() { return this.cronDays(1); }
  tuesdays() { return this.cronDays(2); }
  wednesdays() { return this.cronDays(3); }
  thursdays() { return this.cronDays(4); }
  fridays() { return this.cronDays(5); }
  saturdays() { return this.cronDays(6); }

  cronDays(dow) {
    const parts = this.#cronExpression.split(' ');
    parts[4] = String(dow);
    this.#cronExpression = parts.join(' ');
    return this;
  }

  at(timeStr) {
    return this.dailyAt(timeStr);
  }

  // ─── Constraints & Filters ───────────────────────────────────────────────

  weekdays() {
    this.#daysConstraint = 'weekdays';
    return this;
  }

  weekends() {
    this.#daysConstraint = 'weekends';
    return this;
  }

  when(closureOrBool) {
    this.#filters.push(closureOrBool);
    return this;
  }

  skip(closureOrBool) {
    this.#rejects.push(closureOrBool);
    return this;
  }

  between(start, end) {
    this.#timeBetween = { start, end, unless: false };
    return this;
  }

  unlessBetween(start, end) {
    this.#timeBetween = { start, end, unless: true };
    return this;
  }

  timezone(tz) {
    this.#tz = tz;
    return this;
  }

  // ─── Mutex & Locks ───────────────────────────────────────────────────────

  withoutOverlapping(expiresInMs = 86400000) {
    this.#overlapsAllowed = false;
    this.#overlapExpiresMs = expiresInMs;
    return this;
  }

  onOneServer() {
    this.#oneServer = true;
    return this.withoutOverlapping();
  }

  // ─── Hooks & Background ─────────────────────────────────────────────────

  runInBackground() {
    this.#inBackground = true;
    return this;
  }

  before(fn) {
    this.#beforeCallbacks.push(fn);
    return this;
  }

  after(fn) {
    this.#afterCallbacks.push(fn);
    return this;
  }

  onSuccess(fn) {
    this.#successCallbacks.push(fn);
    return this;
  }

  onFailure(fn) {
    this.#failureCallbacks.push(fn);
    return this;
  }

  // ─── Evaluation ──────────────────────────────────────────────────────────

  isDue(date = new Date(), customTz = null) {
    const tz = customTz ?? this.#tz;

    // Check Cron Expression
    if (!CronParser.isDue(this.#cronExpression, date, tz)) {
      return false;
    }

    // Check Days Constraint (weekdays / weekends)
    const targetDate = tz ? CronParser.getZonedDate(date, tz) : date;
    const dow = targetDate.getDay();
    if (this.#daysConstraint === 'weekdays' && (dow === 0 || dow === 6)) return false;
    if (this.#daysConstraint === 'weekends' && (dow >= 1 && dow <= 5)) return false;

    // Check Time Between
    if (this.#timeBetween) {
      const inRange = this.#checkTimeBetween(targetDate, this.#timeBetween.start, this.#timeBetween.end);
      if (this.#timeBetween.unless ? inRange : !inRange) return false;
    }

    // Evaluate when() filters
    for (const filter of this.#filters) {
      const val = typeof filter === 'function' ? filter() : filter;
      if (!val) return false;
    }

    // Evaluate skip() rejects
    for (const reject of this.#rejects) {
      const val = typeof reject === 'function' ? reject() : reject;
      if (val) return false;
    }

    return true;
  }

  #checkTimeBetween(date, startStr, endStr) {
    const currentMins = date.getHours() * 60 + date.getMinutes();

    const [sh, sm] = startStr.split(':').map((v) => parseInt(v, 10));
    const startMins = (sh ?? 0) * 60 + (sm ?? 0);

    const [eh, em] = endStr.split(':').map((v) => parseInt(v, 10));
    const endMins = (eh ?? 0) * 60 + (em ?? 0);

    if (startMins <= endMins) {
      return currentMins >= startMins && currentMins <= endMins;
    }
    // Midnight wrap-around
    return currentMins >= startMins || currentMins <= endMins;
  }

  // ─── Execution ───────────────────────────────────────────────────────────

  async run(container = null, eventsDispatcher = null, mutex = null) {
    // Check Mutex / Overlap Lock
    if (mutex && !this.#overlapsAllowed) {
      const locked = await mutex.exists(this.#taskName);
      if (locked) {
        return { status: 'skipped', reason: 'overlapping_lock' };
      }
      await mutex.lock(this.#taskName, this.#overlapExpiresMs);
    }

    // Fire Before callbacks
    for (const cb of this.#beforeCallbacks) {
      try { await cb(); } catch {}
    }

    let result;
    let error = null;

    try {
      if (this.#task.type === 'callback') {
        result = await this.#task.target(...this.#task.args);
      } else if (this.#task.type === 'job') {
        if (container && container.has('queue')) {
          const queue = container.make('queue');
          result = await queue.push(this.#task.target);
        } else if (typeof this.#task.target.handle === 'function') {
          result = await this.#task.target.handle();
        }
      } else if (this.#task.type === 'command') {
        if (container && container.has('console')) {
          const consoleApp = container.make('console');
          result = await consoleApp.call(this.#task.target, this.#task.args);
        }
      }
    } catch (err) {
      error = err;
    } finally {
      // Unlock Mutex
      if (mutex && !this.#overlapsAllowed) {
        await mutex.unlock(this.#taskName);
      }
    }

    // Fire After callbacks
    for (const cb of this.#afterCallbacks) {
      try { await cb(result, error); } catch {}
    }

    if (error) {
      for (const cb of this.#failureCallbacks) {
        try { await cb(error); } catch {}
      }
      throw error;
    } else {
      for (const cb of this.#successCallbacks) {
        try { await cb(result); } catch {}
      }
    }

    return { status: 'success', result };
  }

  static dayNameToNumber(dayName) {
    const map = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    return map[String(dayName).toLowerCase()] ?? 0;
  }

  // Getters
  expression() { return this.#cronExpression; }
  name(customName = null) {
    if (customName !== null) {
      this.#taskName = customName;
      return this;
    }
    return this.#taskName;
  }
  getTimezone() { return this.#tz; }
  overlapsAllowed() { return this.#overlapsAllowed; }
  isOneServer() { return this.#oneServer; }
  isBackground() { return this.#inBackground; }
}

export default EventTask;
