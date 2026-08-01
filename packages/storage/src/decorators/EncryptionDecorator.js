import crypto from "node:crypto";
import IDriverDecorator from "../contracts/IDriverDecorator.js";

export class EncryptionDecorator extends IDriverDecorator {
  constructor(driver, secretKey = "ecf-default-encryption-secret-key") {
    super(driver);
    this.key = crypto.createHash("sha256").update(secretKey).digest();
  }

  name() {
    return `${this.driver.name()}:encrypted`;
  }

  supports(capability) {
    return this.driver.supports(capability);
  }

  async put(path, contents, options = {}) {
    const buffer = Buffer.isBuffer(contents) ? contents : Buffer.from(String(contents));
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", this.key, iv);

    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const tag = cipher.getAuthTag();

    const payload = Buffer.concat([iv, tag, encrypted]);
    return this.driver.put(path, payload, options);
  }

  async get(path) {
    const payload = await this.driver.getBuffer ? await this.driver.getBuffer(path) : Buffer.from(await this.driver.get(path));

    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);

    const decipher = crypto.createDecipheriv("aes-256-gcm", this.key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  }

  async exists(path) { return this.driver.exists(path); }
  async delete(path) { return this.driver.delete(path); }
  async copy(source, destination) { return this.driver.copy(source, destination); }
  async move(source, destination) { return this.driver.move(source, destination); }
}

export default EncryptionDecorator;
