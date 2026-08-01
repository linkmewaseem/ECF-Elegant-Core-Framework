import crypto from "node:crypto";

export class ApiKeyService {
  constructor(options = {}) {
    this.prefix = options.prefix || "ecf_live_";
  }

  generateKey() {
    const randomSecret = crypto.randomBytes(24).toString("hex");
    const key = `${this.prefix}${randomSecret}`;
    const hash = this.hashKey(key);
    return {
      key,
      hash,
      prefix: this.prefix
    };
  }

  hashKey(key) {
    return crypto.createHash("sha256").update(key).digest("hex");
  }

  verifyKey(key, expectedHash) {
    const computedHash = this.hashKey(key);
    const expectedBuf = Buffer.from(expectedHash, "hex");
    const computedBuf = Buffer.from(computedHash, "hex");
    if (expectedBuf.length !== computedBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, computedBuf);
  }
}

export default ApiKeyService;
