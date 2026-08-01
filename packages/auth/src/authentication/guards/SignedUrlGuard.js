import crypto from "node:crypto";
import BaseGuard from "./BaseGuard.js";

export class SignedUrlGuard extends BaseGuard {
  constructor(key = "ecf-url-signer-secret") {
    super();
    this.key = key;
  }

  sign(url, expiresInSeconds = 3600) {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const urlObj = new URL(url, "http://localhost");
    urlObj.searchParams.set("expires", String(expiresAt));

    const signature = this.createSignature(urlObj.toString());
    urlObj.searchParams.set("signature", signature);

    return urlObj.toString();
  }

  hasValidSignature(urlStr) {
    try {
      const urlObj = new URL(urlStr, "http://localhost");
      const signature = urlObj.searchParams.get("signature");
      const expires = urlObj.searchParams.get("expires");

      if (!signature || !expires) return false;

      const now = Math.floor(Date.now() / 1000);
      if (now > parseInt(expires, 10)) return false;

      urlObj.searchParams.delete("signature");
      const expectedSignature = this.createSignature(urlObj.toString());

      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expectedSignature);

      if (sigBuf.length !== expBuf.length) return false;
      return crypto.timingSafeEqual(sigBuf, expBuf);
    } catch {
      return false;
    }
  }

  createSignature(str) {
    return crypto.createHmac("sha256", this.key).update(str).digest("hex");
  }
}

export default SignedUrlGuard;
