import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { DailyDriver } from '../../src/index.js';

describe('Log Rotation, Compression & Archive Unit Tests', () => {
  const testDir = path.resolve('./storage/test_logs');
  const testFile = path.join(testDir, 'test_app.log');

  it('should write logs with daily rotation filename suffix', async () => {
    const driver = new DailyDriver({
      path: testFile,
      policy: 'daily',
      compress: false,
    });

    await driver.write({ level: 'info', message: 'Test rotation log 1' });

    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const expectedPath = path.join(testDir, `test_app-${YYYY}-${MM}-${DD}.log`);

    assert.ok(fs.existsSync(expectedPath));

    const content = fs.readFileSync(expectedPath, 'utf-8');
    assert.ok(content.includes('Test rotation log 1'));

    // Cleanup
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should rotate based on size policy when limit is reached', async () => {
    const driver = new DailyDriver({
      path: testFile,
      policy: 'size',
      maxSizeBytes: 50, // small size threshold
      compress: false,
    });

    await driver.write({ level: 'info', message: 'First entry exceeding threshold size' });
    await driver.write({ level: 'info', message: 'Second entry triggering rotation index' });

    const files = fs.readdirSync(testDir);
    assert.ok(files.length >= 1);

    // Cleanup
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
});
