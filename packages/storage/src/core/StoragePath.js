import { InvalidPathException } from "../exceptions/StorageException.js";

export class StoragePath {
  /**
   * Normalize and sanitize storage path key.
   * Throws InvalidPathException if path traversal or invalid characters are detected.
   */
  static normalize(path) {
    if (typeof path !== "string" || path.trim() === "") {
      throw new InvalidPathException(path, "Path must be a non-empty string.");
    }

    // 1. Reject null bytes
    if (path.includes("\0")) {
      throw new InvalidPathException(path, "Null byte character detected.");
    }

    // 2. Reject URL-encoded traversal (%2e%2e or %2E%2E)
    if (/%2e%2e/i.test(path)) {
      throw new InvalidPathException(path, "URL-encoded path traversal detected.");
    }

    // 3. Reject backslashes
    if (path.includes("\\")) {
      throw new InvalidPathException(path, "Backslashes are not permitted in storage keys.");
    }

    // 4. Reject Windows drive letters (e.g. C: or C:/)
    if (/^[a-zA-Z]:/.test(path)) {
      throw new InvalidPathException(path, "Absolute Windows drive paths are not permitted.");
    }

    // 5. Clean leading slashes and ./ (without stripping leading ../)
    let cleaned = path.replace(/^(\/|\.\/)+/, "");

    // 6. Split into segments and validate each segment
    const segments = cleaned.split("/").filter(Boolean);

    for (const segment of segments) {
      if (segment === ".." || segment === ".") {
        throw new InvalidPathException(path, "Path traversal ('..') is strictly forbidden.");
      }
    }

    if (segments.length === 0) {
      throw new InvalidPathException(path, "Path resolves to empty key.");
    }

    return segments.join("/");
  }

  /**
   * Safe join helper.
   */
  static join(...parts) {
    const raw = parts.join("/");
    return this.normalize(raw);
  }
}

export default StoragePath;
