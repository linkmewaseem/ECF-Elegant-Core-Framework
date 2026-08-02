import assert from 'node:assert/strict';
import { ScheduleManager } from '../core/ScheduleManager.js';

export class ScheduleFake extends ScheduleManager {
  #ranTasks = [];
  #skippedTasks = [];

  async runDue(date = new Date(), timezone = null) {
    const due = this.dueTasks(date, timezone);
    const results = [];

    for (const task of due) {
      const res = await task.run();
      if (res.status === 'skipped') {
        this.#skippedTasks.push(task);
      } else {
        this.#ranTasks.push(task);
      }
      results.push(res);
    }

    return results;
  }

  assertScheduled(nameOrPredicate) {
    const tasks = this.getTasks();
    const found = tasks.some((t) =>
      typeof nameOrPredicate === 'function' ? nameOrPredicate(t) : t.name().includes(nameOrPredicate)
    );
    assert.ok(found, `Expected task matching "${nameOrPredicate}" to be scheduled, but none was found.`);
  }

  assertRan(nameOrPredicate) {
    const found = this.#ranTasks.some((t) =>
      typeof nameOrPredicate === 'function' ? nameOrPredicate(t) : t.name().includes(nameOrPredicate)
    );
    assert.ok(found, `Expected task matching "${nameOrPredicate}" to have run, but it did not run.`);
  }

  assertSkipped(nameOrPredicate) {
    const found = this.#skippedTasks.some((t) =>
      typeof nameOrPredicate === 'function' ? nameOrPredicate(t) : t.name().includes(nameOrPredicate)
    );
    assert.ok(found, `Expected task matching "${nameOrPredicate}" to be skipped, but it was not skipped.`);
  }
}

export default ScheduleFake;
