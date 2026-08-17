#!/usr/bin/env node

import { CliApplication } from '../src/kernel/CliApplication.js';
import { EcfDoctorCommand } from '../src/commands/EcfDoctorCommand.js';
import { EcfNewCommand } from '../src/commands/EcfNewCommand.js';
import {
  EcfMakeControllerCommand,
  EcfMakeModelCommand,
  EcfMakeMiddlewareCommand,
  EcfMakeRequestCommand,
  EcfMakePolicyCommand,
  EcfMakeCommandCommand,
  EcfMakeMigrationCommand,
  EcfMakeSeederCommand,
  EcfMakeJobCommand,
  EcfMakeMailCommand,
  EcfMakeNotificationCommand,
  EcfMakeChannelCommand,
  EcfMakeResourceCommand,
  EcfMakeTestCommand
} from '../src/commands/EcfMakeCommands.js';
import {
  EcfMigrateCommand,
  EcfMigrateRollbackCommand,
  EcfMigrateFreshCommand,
  EcfMigrateRefreshCommand,
  EcfMigrateResetCommand,
  EcfMigrateStatusCommand
} from '../src/commands/EcfMigrateCommands.js';

const app = new CliApplication('ECF Enterprise CLI Framework', '1.0.0-alpha.1');
app
  .register(EcfDoctorCommand)
  .register(EcfServeCommand)
  .register(EcfNewCommand)
  .register(EcfMakeControllerCommand)
  .register(EcfMakeModelCommand)
  .register(EcfMakeMiddlewareCommand)
  .register(EcfMakeRequestCommand)
  .register(EcfMakePolicyCommand)
  .register(EcfMakeCommandCommand)
  .register(EcfMakeMigrationCommand)
  .register(EcfMakeSeederCommand)
  .register(EcfMakeJobCommand)
  .register(EcfMakeMailCommand)
  .register(EcfMakeNotificationCommand)
  .register(EcfMakeChannelCommand)
  .register(EcfMakeResourceCommand)
  .register(EcfMakeTestCommand)
  .register(EcfMigrateCommand)
  .register(EcfMigrateRollbackCommand)
  .register(EcfMigrateFreshCommand)
  .register(EcfMigrateRefreshCommand)
  .register(EcfMigrateResetCommand)
  .register(EcfMigrateStatusCommand);

app.run(process.argv.slice(2)).then((code) => {
  if (code !== 0) {
    process.exitCode = code;
  }
});
