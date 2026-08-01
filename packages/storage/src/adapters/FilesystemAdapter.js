import IFilesystem from "../contracts/IFilesystem.js";
import StoragePath from "../core/StoragePath.js";
import StorageResult from "../core/StorageResult.js";
import { UnsupportedCapabilityException } from "../exceptions/StorageException.js";

export class FilesystemAdapter extends IFilesystem {
  constructor(driver, name = "local", eventDispatcher = null) {
    super();
    this.driver = driver;
    this.name = name;
    this.eventDispatcher = eventDispatcher;
  }

  supports(capability) {
    if (typeof this.driver.supports === "function") {
      return this.driver.supports(capability);
    }
    return false;
  }

  async put(pathStr, contents, options = {}) {
    const start = performance.now();
    const key = StoragePath.normalize(pathStr);
    try {
      const res = await this.driver.put(key, contents, options);
      const duration = performance.now() - start;

      this.dispatchEvents("FileWrittenEvent", { disk: this.name, path: key, duration });

      return new StorageResult({
        success: Boolean(res),
        path: key,
        disk: this.name,
        size: Buffer.isBuffer(contents) ? contents.length : Buffer.from(String(contents)).length,
        visibility: options.visibility || "private",
        duration,
        driver: this.driver.name()
      });
    } catch (err) {
      this.dispatchEvents("StorageOperationFailedEvent", { disk: this.name, path: key, error: err.message });
      throw err;
    }
  }

  async get(pathStr) {
    const key = StoragePath.normalize(pathStr);
    return this.driver.get(key);
  }

  async exists(pathStr) {
    const key = StoragePath.normalize(pathStr);
    return this.driver.exists(key);
  }

  async delete(pathStr) {
    const start = performance.now();
    const key = StoragePath.normalize(pathStr);
    const res = await this.driver.delete(key);
    const duration = performance.now() - start;
    this.dispatchEvents("FileDeletedEvent", { disk: this.name, path: key, duration });
    return res;
  }

  async copy(source, destination) {
    const srcKey = StoragePath.normalize(source);
    const destKey = StoragePath.normalize(destination);
    return this.driver.copy(srcKey, destKey);
  }

  async move(source, destination) {
    const srcKey = StoragePath.normalize(source);
    const destKey = StoragePath.normalize(destination);
    return this.driver.move(srcKey, destKey);
  }

  async copyBetweenDisks(sourcePath, targetFilesystem, targetPath) {
    const srcKey = StoragePath.normalize(sourcePath);
    const destKey = StoragePath.normalize(targetPath);

    if (typeof this.driver.readStream === "function" && typeof targetFilesystem.writeStream === "function") {
      const stream = await this.readStream(srcKey);
      return targetFilesystem.writeStream(destKey, stream);
    }

    const content = await this.get(srcKey);
    return targetFilesystem.put(destKey, content);
  }

  async readStream(pathStr) {
    const key = StoragePath.normalize(pathStr);
    if (typeof this.driver.readStream !== "function") {
      throw new UnsupportedCapabilityException("streams", this.driver.name());
    }
    return this.driver.readStream(key);
  }

  async writeStream(pathStr, stream, options = {}) {
    const key = StoragePath.normalize(pathStr);
    if (typeof this.driver.writeStream !== "function") {
      throw new UnsupportedCapabilityException("streams", this.driver.name());
    }
    return this.driver.writeStream(key, stream, options);
  }

  async metadata(pathStr) {
    const key = StoragePath.normalize(pathStr);
    if (typeof this.driver.metadata !== "function") {
      throw new UnsupportedCapabilityException("metadata", this.driver.name());
    }
    return this.driver.metadata(key);
  }

  async temporaryUrl(pathStr, expirationSeconds = 3600) {
    const key = StoragePath.normalize(pathStr);
    if (typeof this.driver.temporaryUrl !== "function") {
      throw new UnsupportedCapabilityException("temporaryUrl", this.driver.name());
    }
    return this.driver.temporaryUrl(key, expirationSeconds);
  }

  async checksum(pathStr, algo = "sha256") {
    const key = StoragePath.normalize(pathStr);
    if (typeof this.driver.checksum !== "function") {
      throw new UnsupportedCapabilityException("checksum", this.driver.name());
    }
    return this.driver.checksum(key, algo);
  }

  async makeDirectory(pathStr) {
    const key = StoragePath.normalize(pathStr);
    if (typeof this.driver.makeDirectory === "function") {
      return this.driver.makeDirectory(key);
    }
    return true;
  }

  async deleteDirectory(pathStr) {
    const key = StoragePath.normalize(pathStr);
    if (typeof this.driver.deleteDirectory === "function") {
      return this.driver.deleteDirectory(key);
    }
    return true;
  }

  async files(directory = "") {
    if (typeof this.driver.files === "function") {
      return this.driver.files(directory);
    }
    return [];
  }

  async allFiles(directory = "") {
    if (typeof this.driver.allFiles === "function") {
      return this.driver.allFiles(directory);
    }
    return [];
  }

  dispatchEvents(eventName, payload) {
    if (this.eventDispatcher && typeof this.eventDispatcher.dispatch === "function") {
      this.eventDispatcher.dispatch(eventName, payload);
    }
  }
}

export default FilesystemAdapter;
