import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { PackageScaffolder, PackageValidator, ProjectScaffolder } from '../../src/index.js';

describe('PackageScaffolder & PackageValidator Unit Tests', () => {
  const testDir = path.resolve('./storage/test_packages');

  it('should scaffold third-party ECF package and validate architecture compliance', async () => {
    const scaffolder = new PackageScaffolder();
    const res = await scaffolder.scaffold('analytics', testDir);

    assert.strictEqual(res.success, true);

    const validator = new PackageValidator();
    const valResult = validator.validate(res.path);

    assert.strictEqual(valResult.passed, true);
    assert.strictEqual(valResult.score, 100);

    // Cleanup
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should scaffold complete new ECF application with ecf new', async () => {
    const scaffolder = new ProjectScaffolder();
    const appDir = path.resolve('./storage/test_app');
    const res = await scaffolder.scaffold(appDir, 'api');

    assert.strictEqual(res.success, true);
    assert.ok(fs.existsSync(path.join(appDir, 'package.json')));
    assert.ok(fs.existsSync(path.join(appDir, 'app.js')));

    // Cleanup
    if (fs.existsSync(appDir)) {
      fs.rmSync(appDir, { recursive: true, force: true });
    }
  });
});
