/**
 * bump-and-publish.mjs
 *
 * Bumps every package in packages/ to 1.0.0-rc.5
 * then publishes via pnpm (which resolves workspace:* → real version numbers).
 *
 * Usage:
 *   node bump-and-publish.mjs          ← dry run (just shows changes)
 *   node bump-and-publish.mjs --apply  ← writes changes to disk
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NEW_VERSION = '1.0.0-rc.5';
const PACKAGES_DIR = path.join(__dirname, 'packages');
const DRY_RUN = !process.argv.includes('--apply');

if (DRY_RUN) {
  console.log('🔍 DRY RUN — pass --apply to write changes\n');
}

const pkgDirs = fs.readdirSync(PACKAGES_DIR).filter(d =>
  fs.statSync(path.join(PACKAGES_DIR, d)).isDirectory()
);

let changed = 0;

for (const dir of pkgDirs) {
  const pkgPath = path.join(PACKAGES_DIR, dir, 'package.json');
  if (!fs.existsSync(pkgPath)) continue;

  const raw = fs.readFileSync(pkgPath, 'utf-8');
  const json = JSON.parse(raw);
  const oldVersion = json.version;

  json.version = NEW_VERSION;

  const updated = JSON.stringify(json, null, 2) + '\n';

  if (DRY_RUN) {
    console.log(`📦 ${json.name}`);
    console.log(`   ${oldVersion}  →  ${NEW_VERSION}`);
  } else {
    fs.writeFileSync(pkgPath, updated, 'utf-8');
    console.log(`✅ ${json.name}  ${oldVersion} → ${NEW_VERSION}`);
  }

  changed++;
}

console.log(`\n${DRY_RUN ? 'Would update' : 'Updated'} ${changed} packages to ${NEW_VERSION}`);

if (!DRY_RUN) {
  console.log('\n🚀 Now run:\n');
  console.log('   pnpm -r publish --access public --no-git-checks\n');
  console.log('pnpm will automatically replace workspace:* with real version numbers in the published tarball.');
}
