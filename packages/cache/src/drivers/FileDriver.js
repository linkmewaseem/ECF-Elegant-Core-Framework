import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import ICacheDriver from "../contracts/ICacheDriver.js";

export class FileDriver extends ICacheDriver {
  constructor(directory = path.join(os.tmpdir(), "ecf-cache")) {
    super();
    this.directory = directory;
    if (!fs.existsSync(this.directory)) {
      fs.mkdirSync(this.directory, { recursive: true });
    }
  }

  getFilePath(key) {
    const hash = crypto.createHash("sha256").update(key).digest("hex");
    return path.join(this.directory, `${hash}.json`);
  }

  get(key, defaultValue = null) {
    const filePath = this.getFilePath(key);
    if (!fs.existsSync(filePath)) return defaultValue;

    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      if (data.expiresAt !== null && Date.now() > data.expiresAt) {
        fs.unlinkSync(filePath);
        return defaultValue;
      }
      return data.value;
    } catch (err) {
      return defaultValue;
    }
  }

  put(key, value, ttlSeconds = 0) {
    const filePath = this.getFilePath(key);
    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    const payload = JSON.stringify({ key, value, expiresAt });
    fs.writeFileSync(filePath, payload, "utf8");
    return true;
  }

  has(key) {
    return this.get(key, undefined) !== undefined;
  }

  forget(key) {
    const filePath = this.getFilePath(key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  flush() {
    if (fs.existsSync(this.directory)) {
      const files = fs.readdirSync(this.directory);
      for (const file of files) {
        if (file.endsWith(".json")) {
          fs.unlinkSync(path.join(this.directory, file));
        }
      }
    }
    return true;
  }

  supportsTags() { return false; }
  supportsLocks() { return true; }
  supportsAtomic() { return false; }
}

export default FileDriver;
