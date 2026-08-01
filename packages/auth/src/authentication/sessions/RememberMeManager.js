import crypto from "node:crypto";

export class RememberMeManager {
  constructor(repository, options = {}) {
    this.repository = repository;
    this.ttl = options.ttl || 60 * 60 * 24 * 30; // 30 days in seconds
    this.cookieName = options.cookieName || "ecf_remember";
  }

  /**
   * Create remember token cookie value and store hashed verifier.
   */
  async createToken(userId, userAgent = "") {
    const selector = crypto.randomBytes(12).toString("hex");
    const verifier = crypto.randomBytes(24).toString("hex");
    const hashedVerifier = this.hashVerifier(verifier);
    const expiresAt = new Date(Date.now() + this.ttl * 1000);
    const userAgentHash = crypto.createHash("sha256").update(userAgent || "").digest("hex");

    if (this.repository && typeof this.repository.create === "function") {
      await this.repository.create(userId, selector, hashedVerifier, expiresAt, { userAgentHash });
    }

    return `${selector}.${verifier}`;
  }

  /**
   * Validate cookie remember token and rotate verifier.
   */
  async validateAndRotate(rawToken, userProvider, userAgent = "") {
    if (!rawToken || !rawToken.includes(".")) {
      return null;
    }

    const [selector, verifier] = rawToken.split(".");
    if (!selector || !verifier) {
      return null;
    }

    if (!this.repository || typeof this.repository.find !== "function") {
      return null;
    }

    const record = await this.repository.find(selector);
    if (!record) {
      return null;
    }

    if (new Date() > new Date(record.expires_at)) {
      await this.repository.delete(selector);
      return null;
    }

    const expectedHash = record.hashed_verifier || record.hashedVerifier;
    const actualHash = this.hashVerifier(verifier);

    const expectedBuf = Buffer.from(expectedHash, "hex");
    const actualBuf = Buffer.from(actualHash, "hex");

    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      // Theft/replay detected! Revoke all tokens for this user for security.
      if (record.user_id && typeof this.repository.deleteAllForUser === "function") {
        await this.repository.deleteAllForUser(record.user_id);
      }
      return null;
    }

    // Retrieve User
    const user = await userProvider.retrieveById(record.user_id);
    if (!user) {
      await this.repository.delete(selector);
      return null;
    }

    // Rotate verifier
    const newVerifier = crypto.randomBytes(24).toString("hex");
    const newHashedVerifier = this.hashVerifier(newVerifier);
    const newExpiresAt = new Date(Date.now() + this.ttl * 1000);

    if (typeof this.repository.updateVerifier === "function") {
      await this.repository.updateVerifier(selector, newHashedVerifier, newExpiresAt);
    }

    return {
      user,
      newToken: `${selector}.${newVerifier}`
    };
  }

  /**
   * Delete remember token by selector.
   */
  async revokeToken(rawToken) {
    if (rawToken && rawToken.includes(".")) {
      const [selector] = rawToken.split(".");
      if (selector && this.repository && typeof this.repository.delete === "function") {
        await this.repository.delete(selector);
      }
    }
  }

  hashVerifier(verifier) {
    return crypto.createHash("sha256").update(verifier).digest("hex");
  }
}

export default RememberMeManager;
