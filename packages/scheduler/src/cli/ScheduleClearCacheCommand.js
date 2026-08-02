export class ScheduleClearCacheCommand {
  static get signature() {
    return 'schedule:clear-cache';
  }

  static get description() {
    return 'Clear all active scheduler mutex locks';
  }

  async handle(app, output = console) {
    if (!app.has('schedule')) {
      output.error?.('Scheduler is not registered in container.');
      return 1;
    }

    const schedule = app.make('schedule');
    schedule.mutex.clear();
    output.info?.('Scheduler mutex locks cleared successfully.');
    return 0;
  }
}

export default ScheduleClearCacheCommand;
