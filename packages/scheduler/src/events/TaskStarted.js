import { Event } from '@ecfjs/events';

export class TaskStarted extends Event {
  constructor(task) {
    super({ taskName: task.name(), expression: task.expression() });
    this.task = task;
  }
}

export default TaskStarted;
