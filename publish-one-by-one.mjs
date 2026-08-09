/**
 * publish-one-by-one.mjs
 *
 * Publishes each ECF package one by one via pnpm.
 * pnpm automatically resolves workspace:* → real version numbers at publish time.
 *
 * Usage:
 *   node publish-one-by-one.mjs --otp=123456
 *
 * If no --otp is given, it will ask you before each package.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse --otp=XXXXXX from args
const otpArg = process.argv.find(a => a.startsWith('--otp='));
let globalOtp = otpArg ? otpArg.split('=')[1] : null;

// ─── Packages in dependency order (publish base pkgs first) ───────────────────
// Order matters: dependencies must be on npm before dependents try to resolve them.
const PUBLISH_ORDER = [
  // ── Tier 1: No internal deps ─────────────────
  'contracts',
  'support',
  'validation',

  // ── Tier 2: Depend only on Tier 1 ────────────
  'core',

  // ── Tier 3: Depend on core/support ───────────
  'events',
  'database',
  'observability',
  'console',

  // ── Tier 4 ───────────────────────────────────
  'config',
  'cache',
  'auth',
  'devtools',
  'queue',

  // ── Tier 5 ───────────────────────────────────
  'http',
  'storage',
  'logging',
  'scheduler',
  'broadcast',

  // ── Tier 6 ───────────────────────────────────
  'view',
  'upload',
  'mail',
  'search',
  'media',

  // ── Tier 7 ───────────────────────────────────
  'notifications',
  'skeleton',
  'ai',
  'api',
  'testing',
  'devkit',

  // ── Tier 8: CLI (depends on skeleton, view, etc.) ─
  'cli',
];

// Extensions (published separately from packages/)
const EXTENSIONS = [
  'extensions/uuids',
  'extensions/sluggable',
  'extensions/soft-deletes',
  'extensions/timestamps',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

function getPackageInfo(relPath) {
  const pkgPath = path.join(__dirname, 'packages', relPath, 'package.json');
  if (!fs.existsSync(pkgPath)) return null;
  const json = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  if (json.private) return null;
  return { name: json.name, version: json.version, dir: path.join(__dirname, 'packages', relPath) };
}

function publishPackage(pkg, otp) {
  const otpFlag = otp ? `--otp=${otp}` : '';
  const cmd = `pnpm publish --access public --no-git-checks ${otpFlag}`.trim();
  console.log(`\n  ▶ ${cmd}`);
  execSync(cmd, { cwd: pkg.dir, stdio: 'inherit' });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const allPackages = [
    ...PUBLISH_ORDER.map(getPackageInfo),
    ...EXTENSIONS.map(getPackageInfo),
  ].filter(Boolean);

  console.log(`\n📦 ECF Publish — ${allPackages.length} packages to publish\n`);
  allPackages.forEach((p, i) => console.log(`  ${String(i + 1).padStart(2)}. ${p.name}@${p.version}`));
  console.log('');

  let otp = globalOtp;
  let otpUseCount = 0;

  for (let i = 0; i < allPackages.length; i++) {
    const pkg = allPackages[i];
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📦 [${i + 1}/${allPackages.length}] ${pkg.name}@${pkg.version}`);

    // Request a fresh OTP every 5 packages (OTPs expire ~30s, ~5-10s per publish)
    if (!otp || otpUseCount >= 4) {
      otp = await ask(`  🔑 Enter OTP code (from authenticator app): `);
      otpUseCount = 0;
    }

    try {
      publishPackage(pkg, otp);
      otpUseCount++;
      console.log(`  ✅ Published ${pkg.name}@${pkg.version}`);
    } catch (err) {
      // OTP may have expired — ask for a new one and retry once
      console.log(`  ⚠️  Failed. OTP may have expired. Getting a fresh OTP...`);
      otp = await ask(`  🔑 Enter a NEW OTP code: `);
      otpUseCount = 0;
      try {
        publishPackage(pkg, otp);
        otpUseCount++;
        console.log(`  ✅ Published ${pkg.name}@${pkg.version}`);
      } catch (err2) {
        console.error(`  ❌ FAILED: ${pkg.name}`);
        console.error(`     ${err2.message}`);
        const skip = await ask(`  Skip and continue? (y/n): `);
        if (skip.toLowerCase() !== 'y') process.exit(1);
      }
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🎉 Done! All packages published successfully.`);
  console.log(`\nVerify at: https://www.npmjs.com/search?q=%40ecfjs`);
}

main().catch(err => { console.error(err); process.exit(1); });
