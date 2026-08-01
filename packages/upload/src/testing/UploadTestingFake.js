import assert from "node:assert/strict";
import UploadedFile from "../core/UploadedFile.js";

export class UploadTestingFake {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.uploads = [];
  }

  fakeFile(name = "avatar.jpg", options = {}) {
    return UploadedFile.fake(name, {
      ...options,
      storageManager: this.storageManager
    });
  }

  recordUpload(manifest) {
    this.uploads.push(manifest);
  }

  assertUploaded(fileName) {
    const found = this.uploads.some(u => u.name === fileName || u.originalName === fileName);
    assert.ok(found, `Expected file '${fileName}' to have been uploaded, but it was not found.`);
  }

  assertCount(expectedCount) {
    assert.equal(this.uploads.length, expectedCount, `Expected ${expectedCount} uploads, but recorded ${this.uploads.length}.`);
  }
}

export default UploadTestingFake;
