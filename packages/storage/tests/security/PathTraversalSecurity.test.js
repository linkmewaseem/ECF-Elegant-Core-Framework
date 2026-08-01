import test from "node:test";
import assert from "node:assert/strict";
import StoragePath from "../../src/core/StoragePath.js";
import { InvalidPathException } from "../../src/exceptions/StorageException.js";

test("PathTraversalSecurity - rejects path traversal attempts", () => {
  const badPaths = [
    "../etc/passwd",
    "..\\windows\\system32",
    "avatars/../../secret.key",
    "file%2e%2e%2fsecret",
    "file\0.png",
    "C:\\Windows\\System32\\cmd.exe",
    "D:/data/file.txt",
    "uploads/\\backslash"
  ];

  for (const badPath of badPaths) {
    assert.throws(() => {
      StoragePath.normalize(badPath);
    }, InvalidPathException, `Path '${badPath}' MUST throw InvalidPathException`);
  }
});

test("PathTraversalSecurity - cleans leading slashes and normalizes valid keys", () => {
  assert.equal(StoragePath.normalize("/avatars/user.png"), "avatars/user.png");
  assert.equal(StoragePath.normalize("./documents/report.pdf"), "documents/report.pdf");
  assert.equal(StoragePath.normalize("folder/subfolder/file.txt"), "folder/subfolder/file.txt");
});
