import { Readable } from "node:stream";
import IStorageDriver from "../contracts/IStorageDriver.js";

export class NullDriver extends IStorageDriver {
  name() {
    return "null";
  }

  supports() {
    return false;
  }

  async put() { return true; }
  async get() { return ""; }
  async exists() { return false; }
  async delete() { return true; }
  async copy() { return true; }
  async move() { return true; }
  async readStream() { return Readable.from([]); }
  async writeStream() { return true; }
}

export default NullDriver;
