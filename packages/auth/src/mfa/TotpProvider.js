import crypto from "node:crypto";
import IMultiFactorProvider from "../contracts/IMultiFactorProvider.js";

export class TotpProvider extends IMultiFactorProvider {
  constructor(options = {}) {
    super();
    this.digits = options.digits || 6;
    this.step = options.step || 30;
    this.algorithm = options.algorithm || "sha1";
    this.window = options.window || 1; // ±1 time step tolerance
    this.encryptionKey = options.encryptionKey || "ecf-totp-encryption-secret";
  }

  name() {
    return "totp";
  }

  /**
   * Generate new base32 TOTP secret and QR code URI.
   */
  generateSecret(user, issuer = "ECF Platform") {
    const buffer = crypto.randomBytes(20);
    const secret = this.base32Encode(buffer);
    const label = encodeURIComponent(user.email || user.name || "user");
    const uri = `otpauth://totp/${encodeURIComponent(issuer)}:${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=${this.algorithm.toUpperCase()}&digits=${this.digits}&period=${this.step}`;

    const encryptedSecret = this.encryptSecret(secret);

    return {
      secret,
      encryptedSecret,
      uri
    };
  }

  /**
   * Verify TOTP code with time-window tolerance and replay protection.
   */
  verifyCode(encryptedSecret, code, lastVerifiedStep = null) {
    if (!encryptedSecret || !code) return false;
    const secret = this.decryptSecret(encryptedSecret);
    const nowStep = Math.floor(Date.now() / 1000 / this.step);

    for (let i = -this.window; i <= this.window; i++) {
      const targetStep = nowStep + i;
      if (lastVerifiedStep && targetStep <= lastVerifiedStep) {
        continue; // Replay prevention
      }

      const generatedCode = this.generateHOTP(secret, targetStep);
      const codeBuf = Buffer.from(code.trim());
      const genBuf = Buffer.from(generatedCode);

      if (codeBuf.length === genBuf.length && crypto.timingSafeEqual(codeBuf, genBuf)) {
        return {
          valid: true,
          verifiedStep: targetStep
        };
      }
    }

    return { valid: false, verifiedStep: null };
  }

  generateHOTP(secret, counter) {
    const key = this.base32Decode(secret);
    const buf = Buffer.alloc(8);
    let tmp = counter;
    for (let i = 7; i >= 0; i--) {
      buf[i] = tmp & 0xff;
      tmp = tmp >> 8;
    }

    const hmac = crypto.createHmac(this.algorithm, key).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const otp = binary % Math.pow(10, this.digits);
    return String(otp).padStart(this.digits, "0");
  }

  encryptSecret(secret) {
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      crypto.createHash("sha256").update(this.encryptionKey).digest(),
      Buffer.alloc(16, 0)
    );
    let encrypted = cipher.update(secret, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  }

  decryptSecret(encryptedSecret) {
    try {
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        crypto.createHash("sha256").update(this.encryptionKey).digest(),
        Buffer.alloc(16, 0)
      );
      let decrypted = decipher.update(encryptedSecret, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch {
      return encryptedSecret; // Fallback if plain secret
    }
  }

  base32Encode(buffer) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = 0;
    let value = 0;
    let output = "";
    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;
      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }
    return output;
  }

  base32Decode(input) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const cleaned = input.toUpperCase().replace(/=+$/g, "");
    let bits = 0;
    let value = 0;
    const output = [];

    for (let i = 0; i < cleaned.length; i++) {
      const idx = alphabet.indexOf(cleaned[i]);
      if (idx === -1) continue;
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }
    return Buffer.from(output);
  }
}

export default TotpProvider;
