import crypto from "node:crypto";
import IHasher from "../../contracts/IHasher.js";

export class PasswordHasher extends IHasher {
  constructor(options = {}) {
    super();
    this.algorithm = options.algorithm || "scrypt";
    this.scryptOptions = {
      cost: options.cost || 16384, // N
      blockSize: options.blockSize || 8, // r
      parallelization: options.parallelization || 1, // p
      keyLength: options.keyLength || 64,
      ...options.scryptOptions
    };
  }

  /**
   * Hash a plain password.
   */
  async make(value, options = {}) {
    if (!value || typeof value !== "string") {
      throw new Error("Password must be a non-empty string.");
    }

    const algo = options.algorithm || this.algorithm;
    const salt = crypto.randomBytes(16).toString("hex");

    if (algo === "argon2id" && typeof crypto.argon2 === "function") {
      // Argon2id if available on modern Node release
      const hash = await new Promise((resolve, reject) => {
        crypto.argon2(value, salt, { type: "argon2id" }, (err, result) => {
          if (err) reject(err);
          else resolve(result.toString("hex"));
        });
      });
      return `$ecf$argon2id$v=19$m=65536,t=3,p=1$${salt}$${hash}`;
    }

    if (algo === "pbkdf2") {
      const iterations = options.iterations || 100000;
      const keylen = options.keyLength || 64;
      const hash = crypto.pbkdf2Sync(value, salt, iterations, keylen, "sha256").toString("hex");
      return `$ecf$pbkdf2$v=1,i=${iterations}$${salt}$${hash}`;
    }

    // Default scrypt
    const N = options.cost || this.scryptOptions.cost;
    const r = options.blockSize || this.scryptOptions.blockSize;
    const p = options.parallelization || this.scryptOptions.parallelization;
    const keylen = options.keyLength || this.scryptOptions.keyLength;

    const hash = crypto.scryptSync(value, salt, keylen, { N, r, p }).toString("hex");
    return `$ecf$scrypt$N=${N},r=${r},p=${p}$${salt}$${hash}`;
  }

  /**
   * Verify password against a versioned hash envelope.
   */
  async check(value, hashedValue) {
    if (!value || !hashedValue || typeof hashedValue !== "string") {
      return false;
    }

    const parts = hashedValue.split("$");
    // Format: ["", "ecf", algo, params, salt, hash]
    if (parts.length < 6 || parts[1] !== "ecf") {
      return false;
    }

    const algo = parts[2];
    const paramString = parts[3];
    const salt = parts[4];
    const expectedHash = parts[5];

    let computedHashHex = "";

    try {
      if (algo === "scrypt") {
        const params = Object.fromEntries(
          paramString.split(",").map(p => {
            const [k, v] = p.split("=");
            return [k, parseInt(v, 10)];
          })
        );
        const N = params.N || 16384;
        const r = params.r || 8;
        const p = params.p || 1;
        const keylen = Buffer.from(expectedHash, "hex").length || 64;

        computedHashHex = crypto.scryptSync(value, salt, keylen, { N, r, p }).toString("hex");
      } else if (algo === "pbkdf2") {
        const params = Object.fromEntries(
          paramString.split(",").map(p => {
            const [k, v] = p.split("=");
            return [k, parseInt(v, 10)];
          })
        );
        const iterations = params.i || 100000;
        const keylen = Buffer.from(expectedHash, "hex").length || 64;
        computedHashHex = crypto.pbkdf2Sync(value, salt, iterations, keylen, "sha256").toString("hex");
      } else if (algo === "argon2id" && typeof crypto.argon2 === "function") {
        computedHashHex = await new Promise((resolve, reject) => {
          crypto.argon2(value, salt, { type: "argon2id" }, (err, result) => {
            if (err) reject(err);
            else resolve(result.toString("hex"));
          });
        });
      } else {
        return false;
      }

      const expectedBuf = Buffer.from(expectedHash, "hex");
      const computedBuf = Buffer.from(computedHashHex, "hex");

      if (expectedBuf.length !== computedBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuf, computedBuf);
    } catch {
      return false;
    }
  }

  /**
   * Check if password needs rehashing due to parameter/algorithm update.
   */
  needsRehash(hashedValue, options = {}) {
    if (!hashedValue || typeof hashedValue !== "string") return true;
    const parts = hashedValue.split("$");
    if (parts.length < 6 || parts[1] !== "ecf") return true;

    const targetAlgo = options.algorithm || this.algorithm;
    const currentAlgo = parts[2];
    if (currentAlgo !== targetAlgo) return true;

    if (targetAlgo === "scrypt") {
      const params = Object.fromEntries(
        parts[3].split(",").map(p => {
          const [k, v] = p.split("=");
          return [k, parseInt(v, 10)];
        })
      );
      const targetN = options.cost || this.scryptOptions.cost;
      if (params.N !== targetN) return true;
    }

    return false;
  }
}

export default PasswordHasher;
