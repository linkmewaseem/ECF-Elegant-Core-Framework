import assert from "node:assert/strict";
import FilesystemAdapter from "../adapters/FilesystemAdapter.js";
import MemoryDriver from "../drivers/MemoryDriver.js";

export class StorageTestingFake extends FilesystemAdapter {
  constructor(name = "fake") {
    const memoryDriver = new MemoryDriver();
    super(memoryDriver, name);
    this.memoryDriver = memoryDriver;
  }

  async assertExists(pathStr) {
    const exists = await this.exists(pathStr);
    assert.ok(exists, `Expected file '${pathStr}' to exist on disk '${this.name}', but it was missing.`);
  }

  async assertMissing(pathStr) {
    const exists = await this.exists(pathStr);
    assert.equal(exists, false, `Expected file '${pathStr}' to be missing on disk '${this.name}', but it exists.`);
  }

  async assertCount(expectedCount, directory = "") {
    const files = await this.allFiles(directory);
    assert.equal(files.length, expectedCount, `Expected ${expectedCount} files in '${directory}', but found ${files.length}.`);
  }

  async assertChecksum(pathStr, expectedChecksum, algo = "sha256") {
    const actual = await this.checksum(pathStr, algo);
    assert.equal(actual, expectedChecksum, `Expected checksum '${expectedChecksum}', but got '${actual}'.`);
  }

  async assertVisibility(pathStr, expectedVisibility) {
    const meta = await this.metadata(pathStr);
    assert.equal(meta.visibility, expectedVisibility, `Expected visibility '${expectedVisibility}', but got '${meta.visibility}'.`);
  }
}

export default StorageTestingFake;
