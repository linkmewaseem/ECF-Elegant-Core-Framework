export class ScheduleTestCommand {
  static get signature() {
    return 'schedule:test {name}';
  }

  static get description() {
    return 'Run a specific scheduled task on demand for testing';
  }

  async handle(app, options = {}, output = console) {
    if (!app.has('schedule')) {
      output.error?.('Scheduler is not registered in container.');
      return 1;
    }

    const schedule = app.make('schedule');
    const name = options.name;
    const task = schedule.getTasks().find((t) => t.name().includes(name));

    if (!task) {
      output.error?.(`No scheduled task found matching "${name}".`);
      return 1;
    }

    output.info?.(`Running scheduled task [${task.name()}] on demand...`);
    const res = await task.run(app);
    output.info?.(`Task [${task.name()}] completed successfully.`);
    return 0;
  }
}

export default ScheduleTestCommand;
