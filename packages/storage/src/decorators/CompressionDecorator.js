import zlib from "node:zlib";
import { promisify } from "node:util";
import IDriverDecorator from "../contracts/IDriverDecorator.js";

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export class CompressionDecorator extends IDriverDecorator {
  name() {
    return `${this.driver.name()}:compressed`;
  }

  supports(capability) {
    return this.driver.supports(capability);
  }

  async put(path, contents, options = {}) {
    const buffer = Buffer.isBuffer(contents) ? contents : Buffer.from(String(contents));
    const compressed = await gzip(buffer);
    return this.driver.put(path, compressed, options);
  }

  async get(path) {
    const compressed = await this.driver.getBuffer ? await this.driver.getBuffer(path) : Buffer.from(await this.driver.get(path));
    const decompressed = await gunzip(compressed);
    return decompressed.toString("utf8");
  }

  async exists(path) { return this.driver.exists(path); }
  async delete(path) { return this.driver.delete(path); }
  async copy(source, destination) { return this.driver.copy(source, destination); }
  async move(source, destination) { return this.driver.move(source, destination); }
}

export default CompressionDecorator;
