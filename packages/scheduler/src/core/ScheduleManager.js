import { EventTask } from './EventTask.js';
import { ScheduleMutex } from './ScheduleMutex.js';
import { TaskStarted } from '../events/TaskStarted.js';
import { TaskFinished } from '../events/TaskFinished.js';
import { TaskSkipped } from '../events/TaskSkipped.js';
import { TaskFailed } from '../events/TaskFailed.js';

export class ScheduleManager {
  #container;
  #mutex;
  #tasks = [];

  constructor(container = null) {
    this.#container = container;
    const cache = container?.has('cache') ? container.make('cache') : null;
    this.#mutex = new ScheduleMutex(cache);
  }

  command(commandName, args = [], name = null) {
    const task = new EventTask('command', commandName, args, name);
    this.#tasks.push(task);
    return task;
  }

  job(jobTarget, args = [], name = null) {
    const task = new EventTask('job', jobTarget, args, name);
    this.#tasks.push(task);
    return task;
  }

  call(callback, args = [], name = null) {
    const task = new EventTask('callback', callback, args, name);
    this.#tasks.push(task);
    return task;
  }

  getTasks() {
    return [...this.#tasks];
  }

  dueTasks(date = new Date(), timezone = null) {
    return this.#tasks.filter((task) => task.isDue(date, timezone));
  }

  async runDue(date = new Date(), timezone = null) {
    const due = this.dueTasks(date, timezone);
    const results = [];

    const events = this.#container?.has('events') ? this.#container.make('events') : null;
    const observability = this.#container?.has('observability') ? this.#container.make('observability') : null;

    for (const task of due) {
      const taskName = task.name();
      let span = null;

      if (observability) {
        span = observability.startSpan(`schedule: ${taskName}`, { category: 'schedule', cron: task.expression() });
      }

      if (events) {
        await events.dispatch(new TaskStarted(task));
      }

      try {
        const res = await task.run(this.#container, events, this.#mutex);
        if (res.status === 'skipped') {
          if (events) await events.dispatch(new TaskSkipped(task, res.reason));
          if (span) observability.finishSpan(span, { status: 'skipped', reason: res.reason });
          results.push({ task, status: 'skipped', reason: res.reason });
        } else {
          if (events) await events.dispatch(new TaskFinished(task, res.result));
          if (span) observability.finishSpan(span, { status: 'ok' });
          results.push({ task, status: 'success', result: res.result });
        }
      } catch (err) {
        if (events) await events.dispatch(new TaskFailed(task, err));
        if (span) {
          span.recordError(err);
          observability.finishSpan(span);
        }
        results.push({ task, status: 'failed', error: err });
      }
    }

    return results;
  }

  clear() {
    this.#tasks = [];
    this.#mutex.clear();
    return this;
  }

  get mutex() {
    return this.#mutex;
  }
}

export default ScheduleManager;
