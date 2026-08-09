import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { Command } from '../kernel/Command.js';
import { Prompts } from '../output/Prompts.js';

const require = createRequire(import.meta.url);

/**
 * Recursively copy a directory, skipping node_modules and .git.
 * @param {string} src  Absolute source path
 * @param {string} dest Absolute destination path
 */
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;

    const srcPath  = path.join(src,  entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export class EcfNewCommand extends Command {
  constructor() {
    super();
    this.signature    = 'new {name} {--type=}';
    this.description  = 'Scaffold a new ECF application from a blueprint template';
  }

  async handle(input, output) {
    const name = input.argument('name');

    if (!name) {
      output.error('Project name is required. Usage: ecf new <name>');
      return;
    }

    // ── Blueprint selection ──────────────────────────────────────────────────
    const blueprints = { api: 'JSON-only API — JWT auth, no views', ssr: 'Server-rendered app — HTML views, session auth' };
    const choices    = Object.keys(blueprints);

    let type = input.option('type') || '';
    type = type.toString().toLowerCase();

    if (!blueprints[type]) {
      // Interactive selection when --type is omitted or invalid
      const choice = await Prompts.select(
        'Which blueprint would you like to use?',
        choices.map(k => `${k.padEnd(4)}  — ${blueprints[k]}`),
        0
      );
      type = choice.split(/\s/)[0]; // pull just "api" or "ssr"
    }

    // ── Resolve skeleton blueprint path ──────────────────────────────────────
    let skeletonRoot;
    try {
      // Works both in the monorepo (workspace link) and when installed via npm
      skeletonRoot = path.dirname(require.resolve('@ecfjs/skeleton/package.json'));
    } catch {
      output.error('Could not locate @ecfjs/skeleton. Make sure it is installed.');
      return;
    }

    const blueprintPath = path.join(skeletonRoot, 'v1', type);

    if (!fs.existsSync(blueprintPath)) {
      output.error(`Blueprint "${type}" not found at ${blueprintPath}.`);
      return;
    }

    // ── Target directory ─────────────────────────────────────────────────────
    const targetPath = path.join(process.cwd(), name);

    if (fs.existsSync(targetPath)) {
      output.error(`Directory "${name}" already exists. Choose a different name or remove it first.`);
      return;
    }

    // ── Copy blueprint ───────────────────────────────────────────────────────
    output.line(`\n\x1b[1m  Scaffolding new ECF ${type.toUpperCase()} project…\x1b[0m\n`);

    copyDir(blueprintPath, targetPath);
    output.success(`Blueprint copied   → ${path.relative(process.cwd(), targetPath)}`);

    // ── Rewrite package.json name ────────────────────────────────────────────
    const pkgPath = path.join(targetPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      pkg.name    = name;
      pkg.private = true;
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
      output.success(`package.json       → name set to "${name}"`);
    }

    // ── Rewrite ecf.config.js name ───────────────────────────────────────────
    const cfgPath = path.join(targetPath, 'ecf.config.js');
    if (fs.existsSync(cfgPath)) {
      let cfg = fs.readFileSync(cfgPath, 'utf-8');
      // Replace the name: "..." field (first occurrence is always the project name)
      cfg = cfg.replace(/name:\s*["'][^"']*["']/, `name: "${name}"`);
      fs.writeFileSync(cfgPath, cfg, 'utf-8');
      output.success(`ecf.config.js      → name set to "${name}"`);
    }

    // ── Next-step instructions ───────────────────────────────────────────────
    output.line('');
    output.line('\x1b[32m┌──────────────────────────────────────────────────┐\x1b[0m');
    output.line(`\x1b[32m│\x1b[0m  \x1b[1m✔ Project "${name}" created successfully!\x1b[0m         \x1b[32m│\x1b[0m`);
    output.line('\x1b[32m└──────────────────────────────────────────────────┘\x1b[0m');
    output.line('');
    output.line('\x1b[1mNext steps:\x1b[0m');
    output.line(`  \x1b[36m1.\x1b[0m  cd ${name}`);
    output.line(`  \x1b[36m2.\x1b[0m  npm install`);
    output.line(`  \x1b[36m3.\x1b[0m  cp .env.example .env   \x1b[2m# then fill in your DB credentials\x1b[0m`);
    output.line(`  \x1b[36m4.\x1b[0m  npm run dev`);
    output.line('');
  }
}
