import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  EcfMigrateCommand,
  EcfMigrateRollbackCommand,
  EcfMigrateFreshCommand,
  EcfMigrateRefreshCommand,
  EcfMigrateResetCommand,
  EcfMigrateStatusCommand
} from '../src/commands/EcfMigrateCommands.js';
import { Input } from '../src/kernel/Input.js';
import { Output } from '../src/output/Output.js';

const tempDir = path.join(process.cwd(), 'temp_test_migrations');

function setupTestMigrations() {
  fs.mkdirSync(tempDir, { recursive: true });
  const sampleMigration = path.join(tempDir, '20260810000000_create_test_table.js');
  fs.writeFileSync(sampleMigration, `
export default class CreateTestTable {
  async up(schema) {
    await schema.create('test_table', (table) => {
      table.id();
    });
  }
  async down(schema) {
    await schema.dropIfExists('test_table');
  }
}
`, 'utf-8');
}

function cleanupTestMigrations() {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

test('EcfMigrateCommand executes pending migrations from custom path', async () => {
  setupTestMigrations();
  try {
    const cmd = new EcfMigrateCommand();
    const input = new Input({}, { path: 'temp_test_migrations' }, []);
    const messages = [];
    const output = new Output({ write: (msg) => messages.push(msg) });

    await cmd.handle(input, output);

    assert.ok(messages.some(m => m.includes('Migrated') || m.includes('Running database migrations')));
  } finally {
    cleanupTestMigrations();
  }
});

test('EcfMigrateStatusCommand shows migration list status', async () => {
  setupTestMigrations();
  try {
    const cmd = new EcfMigrateStatusCommand();
    const input = new Input({}, {}, []);
    const messages = [];
    const output = new Output({ write: (msg) => messages.push(msg) });

    await cmd.handle(input, output);

    assert.ok(messages.some(m => m.includes('Migration Status') || m.includes('No migrations found')));
  } finally {
    cleanupTestMigrations();
  }
});
