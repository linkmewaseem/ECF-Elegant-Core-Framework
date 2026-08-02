export class ScheduleRunCommand {
  static get signature() {
    return 'schedule:run';
  }

  static get description() {
    return 'Run the scheduled commands for the current minute';
  }

  async handle(app, output = console) {
    if (!app.has('schedule')) {
      output.error?.('Scheduler is not registered in container.');
      return 1;
    }

    const schedule = app.make('schedule');
    output.info?.('Running scheduled tasks...');
    const results = await schedule.runDue();

    if (results.length === 0) {
      output.comment?.('No scheduled tasks are due.');
    } else {
      for (const res of results) {
        if (res.status === 'success') {
          output.info?.(`Running scheduled task [${res.task.name()}] ... DONE`);
        } else if (res.status === 'skipped') {
          output.warn?.(`Skipping scheduled task [${res.task.name()}] (${res.reason})`);
        } else if (res.status === 'failed') {
          output.error?.(`Task [${res.task.name()}] failed: ${res.error?.message}`);
        }
      }
    }

    return 0;
  }
}

export default ScheduleRunCommand;
