import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EcfDoctorCommand } from '../src/commands/EcfDoctorCommand.js';
import { Output } from '../src/output/Output.js';

test('Milestone 12 - EcfDoctorCommand executes environment health diagnostic checks', async () => {
  const doctor = new EcfDoctorCommand();
  const output = new Output({ write: () => {} });

  const checks = await doctor.handle({}, output);
  assert.ok(Array.isArray(checks));
  assert.ok(checks.length >= 3);
  assert.equal(checks[0].item, 'Node.js Version');
  assert.equal(checks[0].status, '✔');
});
