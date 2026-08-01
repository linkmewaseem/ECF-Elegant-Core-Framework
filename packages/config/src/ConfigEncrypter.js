import crypto from "node:crypto";

export class ConfigEncrypter {
  static encrypt(value, secretKey) {
    const key = crypto.createHash("sha256").update(String(secretKey)).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    
    let encrypted = cipher.update(String(value), "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");

    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  }

  static decrypt(encryptedPayload, secretKey) {
    if (!encryptedPayload || !encryptedPayload.includes(":")) {
      return encryptedPayload;
    }

    const [ivHex, authTagHex, encryptedText] = encryptedPayload.split(":");
    const key = crypto.createHash("sha256").update(String(secretKey)).digest();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}

export default ConfigEncrypter;
