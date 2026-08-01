import IStorageManager from "../contracts/IStorageManager.js";
import FilesystemAdapter from "../adapters/FilesystemAdapter.js";
import LocalDriver from "../drivers/LocalDriver.js";
import MemoryDriver from "../drivers/MemoryDriver.js";
import NullDriver from "../drivers/NullDriver.js";
import S3CompatibleDriver from "../drivers/S3CompatibleDriver.js";
import StorageTestingFake from "../testing/StorageTestingFake.js";

export class StorageManager extends IStorageManager {
  constructor(app = null) {
    super();
    this.app = app;
    this.disks = new Map();
    this.customCreators = new Map();
    this.defaultDisk = "local";
  }

  setDefaultDisk(name) {
    this.defaultDisk = name;
  }

  extend(driverName, creator) {
    this.customCreators.set(driverName, creator);
    return this;
  }

  disk(name = null) {
    const diskName = name || this.defaultDisk;
    if (!this.disks.has(diskName)) {
      this.disks.set(diskName, this.resolve(diskName));
    }
    return this.disks.get(diskName);
  }

  fake(diskName = "local") {
    const fakeInstance = new StorageTestingFake(diskName);
    this.disks.set(diskName, fakeInstance);
    return fakeInstance;
  }

  resolve(name) {
    if (this.customCreators.has(name)) {
      const creator = this.customCreators.get(name);
      const driver = creator(this.app, name);
      return new FilesystemAdapter(driver, name, this.getEventDispatcher());
    }

    if (name === "local") {
      return new FilesystemAdapter(new LocalDriver(), "local", this.getEventDispatcher());
    }
    if (name === "memory") {
      return new FilesystemAdapter(new MemoryDriver(), "memory", this.getEventDispatcher());
    }
    if (name === "null") {
      return new FilesystemAdapter(new NullDriver(), "null", this.getEventDispatcher());
    }
    if (name === "s3") {
      return new FilesystemAdapter(new S3CompatibleDriver(), "s3", this.getEventDispatcher());
    }

    throw new Error(`Storage disk/driver '${name}' is not configured.`);
  }

  getEventDispatcher() {
    if (this.app && typeof this.app.make === "function" && this.app.has("events")) {
      return this.app.make("events");
    }
    return null;
  }

  // Facade proxies
  async put(path, contents, options) { return this.disk().put(path, contents, options); }
  async get(path) { return this.disk().get(path); }
  async exists(path) { return this.disk().exists(path); }
  async delete(path) { return this.disk().delete(path); }
  async copy(src, dest) { return this.disk().copy(src, dest); }
  async move(src, dest) { return this.disk().move(src, dest); }
  async readStream(path) { return this.disk().readStream(path); }
  async writeStream(path, stream, options) { return this.disk().writeStream(path, stream, options); }
  async metadata(path) { return this.disk().metadata(path); }
  async temporaryUrl(path, expiration) { return this.disk().temporaryUrl(path, expiration); }
  async checksum(path, algo) { return this.disk().checksum(path, algo); }
}

export default StorageManager;
