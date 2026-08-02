export class ScheduleListCommand {
  static get signature() {
    return 'schedule:list';
  }

  static get description() {
    return 'List all registered scheduled tasks';
  }

  async handle(app, output = console) {
    if (!app.has('schedule')) {
      output.error?.('Scheduler is not registered in container.');
      return 1;
    }

    const schedule = app.make('schedule');
    const tasks = schedule.getTasks();

    if (tasks.length === 0) {
      output.info?.('No scheduled tasks defined.');
      return 0;
    }

    output.info?.('Registered Scheduled Tasks:');
    for (const task of tasks) {
      output.log?.(`- [${task.expression()}] ${task.name()} ${task.getTimezone() ? `(${task.getTimezone()})` : ''}`);
    }

    return 0;
  }
}

export default ScheduleListCommand;
