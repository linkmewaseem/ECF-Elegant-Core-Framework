import IStorageDriver from "../contracts/IStorageDriver.js";
import { UnableToWriteException, FileNotFoundException } from "../exceptions/StorageException.js";

export class StoragePoolDriver extends IStorageDriver {
  constructor(drivers = []) {
    super();
    this.drivers = drivers;
  }

  name() {
    return "pool";
  }

  supports(capability) {
    return this.drivers.some(d => typeof d.supports === "function" && d.supports(capability));
  }

  async put(path, contents, options = {}) {
    let lastError = null;
    for (const driver of this.drivers) {
      try {
        return await driver.put(path, contents, options);
      } catch (err) {
        lastError = err;
      }
    }
    throw new UnableToWriteException(path, `Storage pool failed: ${lastError?.message}`);
  }

  async get(path) {
    for (const driver of this.drivers) {
      try {
        if (await driver.exists(path)) {
          return await driver.get(path);
        }
      } catch {}
    }
    throw new FileNotFoundException(path, "pool");
  }

  async exists(path) {
    for (const driver of this.drivers) {
      try {
        if (await driver.exists(path)) return true;
      } catch {}
    }
    return false;
  }

  async delete(path) {
    let deleted = false;
    for (const driver of this.drivers) {
      try {
        const res = await driver.delete(path);
        if (res) deleted = true;
      } catch {}
    }
    return deleted;
  }
}

export default StoragePoolDriver;
