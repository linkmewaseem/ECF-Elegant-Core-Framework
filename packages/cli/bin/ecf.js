#!/usr/bin/env node

import { CliApplication } from '../src/kernel/CliApplication.js';
import { EcfDoctorCommand } from '../src/commands/EcfDoctorCommand.js';

const app = new CliApplication('ECF Enterprise CLI Framework', '1.0.0-alpha.1');
app.register(EcfDoctorCommand);

app.run(process.argv.slice(2)).then((code) => {
  if (code !== 0) {
    process.exitCode = code;
  }
});
