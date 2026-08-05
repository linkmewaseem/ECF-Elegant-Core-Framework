import { ServiceProvider } from '@ecfjs/core';
import { ScheduleManager } from '../core/ScheduleManager.js';
import { ScheduleRunCommand } from '../cli/ScheduleRunCommand.js';
import { ScheduleListCommand } from '../cli/ScheduleListCommand.js';
import { ScheduleTestCommand } from '../cli/ScheduleTestCommand.js';
import { ScheduleClearCacheCommand } from '../cli/ScheduleClearCacheCommand.js';

export class SchedulerServiceProvider extends ServiceProvider {
  register(app) {
    app.singleton('schedule', (app) => new ScheduleManager(app));

    if (app.has('console')) {
      const consoleApp = app.make('console');
      if (typeof consoleApp.add === 'function') {
        consoleApp.add(ScheduleRunCommand);
        consoleApp.add(ScheduleListCommand);
        consoleApp.add(ScheduleTestCommand);
        consoleApp.add(ScheduleClearCacheCommand);
      }
    }
  }

  boot(app) {
    // Schedule boot setup if required
  }
}

export default SchedulerServiceProvider;
