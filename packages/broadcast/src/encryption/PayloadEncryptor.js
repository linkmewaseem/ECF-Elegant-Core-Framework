import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

export class PayloadEncryptor {
  constructor(secretKey = "ecf-secret-key") {
    this.key = scryptSync(secretKey, "salt", 32);
  }

  encrypt(data) {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const serialized = JSON.stringify(data);
    let encrypted = cipher.update(serialized, "utf8", "base64");
    encrypted += cipher.final("base64");
    const authTag = cipher.getAuthTag().toString("base64");

    return {
      __encrypted: true,
      iv: iv.toString("base64"),
      authTag,
      content: encrypted,
    };
  }

  decrypt(encryptedObj) {
    if (!encryptedObj || !encryptedObj.__encrypted) return encryptedObj;
    const iv = Buffer.from(encryptedObj.iv, "base64");
    const authTag = Buffer.from(encryptedObj.authTag, "base64");
    const decipher = createDecipheriv("aes-256-gcm", this.key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedObj.content, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  }
}

export default PayloadEncryptor;
