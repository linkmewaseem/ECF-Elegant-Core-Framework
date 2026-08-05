import { Event } from '@ecfjs/events';

export class TaskFailed extends Event {
  constructor(task, error) {
    super({ taskName: task.name(), error: error.message });
    this.task = task;
    this.error = error;
  }
}

export default TaskFailed;
