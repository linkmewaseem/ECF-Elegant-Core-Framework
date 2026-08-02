import { Event } from '@ecf/events';

export class TaskStarted extends Event {
  constructor(task) {
    super({ taskName: task.name(), expression: task.expression() });
    this.task = task;
  }
}

export default TaskStarted;
