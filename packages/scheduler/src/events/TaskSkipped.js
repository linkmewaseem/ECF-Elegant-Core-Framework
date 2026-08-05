import { Event } from '@ecfjs/events';

export class TaskSkipped extends Event {
  constructor(task, reason = 'unknown') {
    super({ taskName: task.name(), reason });
    this.task = task;
    this.reason = reason;
  }
}

export default TaskSkipped;
