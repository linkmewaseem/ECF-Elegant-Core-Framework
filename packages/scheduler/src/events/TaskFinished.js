import { Event } from '@ecf/events';

export class TaskFinished extends Event {
  constructor(task, result = null) {
    super({ taskName: task.name(), result });
    this.task = task;
    this.result = result;
  }
}

export default TaskFinished;
