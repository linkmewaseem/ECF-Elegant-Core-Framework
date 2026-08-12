import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { Command } from '../kernel/Command.js';
import { Application, CoreServiceProvider } from '@ecfjs/core';
import { DatabaseServiceProvider } from '@ecfjs/database';

/**
 * Load .env file into process.env before anything else.
 * Application.boot() is synchronous and never awaits async providers, so
 * EnvironmentServiceProvider's lazy singleton may never run in CLI context.
 */
function loadDotEnv(cwd) {
  const envPath = path.join(cwd, '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim().replace(/^export\s+/, '');
    if (!key || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let val = line.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    // Only set if not already present in the environment
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

/**
 * Force-load all JS config files into the config manager.
 * Application.boot() is synchronous; ConfigServiceProvider.boot() is async
 * but never awaited, so JS config files (database.js, http.js, etc.) are
 * never resolved before the migrator tries to connect to the database.
 */
async function forceLoadConfig(app, cwd) {
  if (!app.has('config')) return;

  const configDir = path.join(cwd, 'config');
  if (!fs.existsSync(configDir)) return;

  const manager = app.make('config');
  const files = fs.readdirSync(configDir).filter(f => f.endsWith('.js') || f.endsWith('.mjs'));

  for (const file of files) {
    const key = file.replace(/\.(js|mjs)$/, '');
    try {
      const fileUrl = pathToFileURL(path.join(configDir, file)).href;
      const mod = await import(fileUrl);
      manager.load(key, mod.default ?? mod);
    } catch {
      // skip bad config files
    }
  }
}

async function resolveMigrator(customPath = null) {
  const cwd = process.cwd();

  // Step 1: Populate process.env from .env BEFORE bootstrap runs
  loadDotEnv(cwd);

  const bootstrapPath = path.join(cwd, 'bootstrap', 'app.js');

  let app = null;
  if (fs.existsSync(bootstrapPath)) {
    try {
      const module = await import(pathToFileURL(bootstrapPath).href);
      const createApp = module.createApp || module.default;
      if (typeof createApp === 'function') {
        app = await createApp();
      }
    } catch {
      // Fallback if bootstrap/app.js import fails
    }
  }

  if (!app) {
    app = new Application();
    app.register(CoreServiceProvider);
    app.register(DatabaseServiceProvider);
    app.boot();
  }

  // Step 2: Force-load JS config files (Application.boot is sync; async providers are never awaited)
  await forceLoadConfig(app, cwd);

  const migrator = app.make('db.migrator');
  const migrationsPath = customPath
    ? path.resolve(cwd, customPath)
    : path.join(cwd, 'database', 'migrations');

  return { app, migrator, migrationsPath };
}

export class EcfMigrateCommand extends Command {
  constructor() {
    super();
    this.signature = 'migrate {--force} {--path=}';
    this.description = 'Run pending database migrations';
  }

  async handle(input, output) {
    try {
      const customPath = input.option('path');
      const { migrator, migrationsPath } = await resolveMigrator(customPath);

      output.line('\x1b[1m  Running database migrations…\x1b[0m\n');

      const result = await migrator.run(migrationsPath);
      if (!result.ran || result.ran.length === 0) {
        output.info('Nothing to migrate. Database is already up to date.');
        return;
      }

      for (const name of result.ran) {
        output.success(`  ✔ Migrated:  ${name}`);
      }
      output.line(`\n\x1b[32m✔ Successfully ran ${result.ran.length} migration(s) in Batch ${result.batch}.\x1b[0m`);
    } catch (err) {
      output.error(`Migration failed: ${err.message}`);
    }
  }
}

export class EcfMigrateRollbackCommand extends Command {
  constructor() {
    super();
    this.signature = 'migrate:rollback {--step=} {--force}';
    this.description = 'Rollback the last batch of database migrations';
  }

  async handle(input, output) {
    try {
      const stepsOpt = input.option('step');
      const steps = stepsOpt ? parseInt(stepsOpt, 10) : null;
      const { migrator, migrationsPath } = await resolveMigrator();

      output.line('\x1b[1m  Rolling back database migrations…\x1b[0m\n');

      const result = await migrator.rollback(migrationsPath, { steps });
      if (!result.rolledBack || result.rolledBack.length === 0) {
        output.info('Nothing to rollback.');
        return;
      }

      for (const name of result.rolledBack) {
        output.success(`  ✔ Rolled back: ${name}`);
      }
      output.line(`\n\x1b[32m✔ Successfully rolled back ${result.rolledBack.length} migration(s).\x1b[0m`);
    } catch (err) {
      output.error(`Rollback failed: ${err.message}`);
    }
  }
}

export class EcfMigrateFreshCommand extends Command {
  constructor() {
    super();
    this.signature = 'migrate:fresh {--force}';
    this.description = 'Drop all tables and re-run all migrations from scratch';
  }

  async handle(input, output) {
    try {
      const { migrator, migrationsPath } = await resolveMigrator();

      output.line('\x1b[1m  Dropping all tables and re-running migrations…\x1b[0m\n');

      const result = await migrator.fresh(migrationsPath);
      for (const name of result.ran || []) {
        output.success(`  ✔ Migrated:  ${name}`);
      }
      output.line('\n\x1b[32m✔ Database fresh complete. All tables rebuilt.\x1b[0m');
    } catch (err) {
      output.error(`Migrate fresh failed: ${err.message}`);
    }
  }
}

export class EcfMigrateRefreshCommand extends Command {
  constructor() {
    super();
    this.signature = 'migrate:refresh {--force}';
    this.description = 'Reset and re-run all database migrations';
  }

  async handle(input, output) {
    try {
      const { migrator, migrationsPath } = await resolveMigrator();

      output.line('\x1b[1m  Resetting and re-running database migrations…\x1b[0m\n');

      const result = await migrator.refresh(migrationsPath);
      output.line(`Rolled back ${result.rolledBack?.length || 0} migration(s).`);
      for (const name of result.ran || []) {
        output.success(`  ✔ Migrated:  ${name}`);
      }
      output.line('\n\x1b[32m✔ Database refresh complete.\x1b[0m');
    } catch (err) {
      output.error(`Migrate refresh failed: ${err.message}`);
    }
  }
}

export class EcfMigrateResetCommand extends Command {
  constructor() {
    super();
    this.signature = 'migrate:reset {--force}';
    this.description = 'Rollback all database migrations';
  }

  async handle(input, output) {
    try {
      const { migrator, migrationsPath } = await resolveMigrator();

      output.line('\x1b[1m  Resetting all database migrations…\x1b[0m\n');

      const result = await migrator.reset(migrationsPath);
      if (!result.rolledBack || result.rolledBack.length === 0) {
        output.info('No migrations to reset.');
        return;
      }

      for (const name of result.rolledBack) {
        output.success(`  ✔ Rolled back: ${name}`);
      }
      output.line('\n\x1b[32m✔ Database reset complete.\x1b[0m');
    } catch (err) {
      output.error(`Migrate reset failed: ${err.message}`);
    }
  }
}

export class EcfMigrateStatusCommand extends Command {
  constructor() {
    super();
    this.signature = 'migrate:status';
    this.description = 'Show the status of each migration (Ran / Pending)';
  }

  async handle(input, output) {
    try {
      const { migrator, migrationsPath } = await resolveMigrator();

      const list = await migrator.status(migrationsPath);
      if (!list || list.length === 0) {
        output.info('No migrations found in database/migrations directory.');
        return;
      }

      output.line('\n\x1b[1m  Migration Status:\x1b[0m');
      output.line('  --------------------------------------------------');
      for (const item of list) {
        const state = item.ran ? '\x1b[32mRan\x1b[0m' : '\x1b[33mPending\x1b[0m';
        const batch = item.batch ? `[Batch ${item.batch}]` : '';
        output.line(`  ${state.padEnd(16)} ${item.name} ${batch}`);
      }
      output.line('  --------------------------------------------------\n');
    } catch (err) {
      output.error(`Status failed: ${err.message}`);
    }
  }
}
