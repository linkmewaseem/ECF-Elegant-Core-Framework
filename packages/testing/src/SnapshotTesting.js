import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

/**
 * Snapshot Testing Engine.
 * Supports assertSnapshot(), assertJsonSnapshot(), assertHtmlSnapshot(), assertApiSnapshot().
 */
export class SnapshotTesting {
  constructor({ snapshotDir = './__snapshots__' } = {}) {
    this.snapshotDir = snapshotDir;
    this.ensureDirectory();
  }

  ensureDirectory() {
    if (!fs.existsSync(this.snapshotDir)) {
      fs.mkdirSync(this.snapshotDir, { recursive: true });
    }
  }

  assertSnapshot(actual, snapshotName) {
    const filePath = path.join(this.snapshotDir, `${snapshotName}.snap`);
    const actualStr = typeof actual === 'string' ? actual : JSON.stringify(actual, null, 2);

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, actualStr, 'utf-8');
      return true;
    }

    const expectedStr = fs.readFileSync(filePath, 'utf-8');
    assert.strictEqual(
      actualStr,
      expectedStr,
      `Snapshot mismatch for "${snapshotName}". Inspect __snapshots__/${snapshotName}.snap`
    );
    return true;
  }

  assertJsonSnapshot(actual, snapshotName) {
    return this.assertSnapshot(JSON.stringify(actual, null, 2), `${snapshotName}.json`);
  }

  assertHtmlSnapshot(actualHtml, snapshotName) {
    return this.assertSnapshot(actualHtml, `${snapshotName}.html`);
  }

  assertApiSnapshot(apiResponse, snapshotName) {
    const payload = apiResponse.json || apiResponse.body || apiResponse;
    return this.assertJsonSnapshot(payload, `${snapshotName}.api`);
  }
}

export default SnapshotTesting;
