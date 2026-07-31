import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SignatureParser } from '../src/kernel/SignatureParser.js';

test('Milestone 12 - SignatureParser parses command name, arguments, and options', () => {
  const sig = 'make:model {name} {--migration} {--factory} {--table=users}';
  const parsed = SignatureParser.parse(sig);

  assert.equal(parsed.name, 'make:model');
  assert.equal(parsed.arguments.length, 1);
  assert.equal(parsed.arguments[0].name, 'name');

  assert.equal(parsed.options.length, 3);
  assert.equal(parsed.options[0].name, 'migration');
  assert.equal(parsed.options[1].name, 'factory');
  assert.equal(parsed.options[2].name, 'table');
  assert.equal(parsed.options[2].hasValue, true);
  assert.equal(parsed.options[2].defaultValue, 'users');
});
