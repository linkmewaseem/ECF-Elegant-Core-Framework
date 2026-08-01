import crypto from "node:crypto";
import IPasswordBroker from "../../contracts/IPasswordBroker.js";

export class PasswordBroker extends IPasswordBroker {
  constructor(userProvider, tokenRepository, passwordHasher, rateLimiter = null, options = {}) {
    super();
    this.userProvider = userProvider;
    this.tokenRepository = tokenRepository;
    this.passwordHasher = passwordHasher;
    this.rateLimiter = rateLimiter;
    this.ttl = options.ttl || 60 * 60; // 1 hour in seconds
    this.eventDispatcher = options.eventDispatcher || null;
  }

  /**
   * Request password reset link. Enumeration-safe response.
   */
  async sendResetLink(credentials, ipAddress = "127.0.0.1") {
    const email = credentials.email;
    if (!email) {
      return { status: "INVALID_USER", message: "If an account exists, a reset link has been sent." };
    }

    const rateKey = `pwd_reset:${email}:${ipAddress}`;
    if (this.rateLimiter && await this.rateLimiter.tooManyAttempts(rateKey, 3)) {
      return { status: "RATE_LIMITED", message: "Too many password reset attempts. Please try again later." };
    }
    if (this.rateLimiter) {
      await this.rateLimiter.hit(rateKey, 300);
    }

    const user = await this.userProvider.retrieveByCredentials({ email });
    if (!user) {
      // Enumeration safety: return generic message
      return { status: "RESET_LINK_SENT", message: "If an account exists, a reset link has been sent." };
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + this.ttl * 1000);

    if (this.tokenRepository) {
      await this.tokenRepository.create(email, hashedToken, expiresAt);
    }

    if (this.eventDispatcher) {
      this.eventDispatcher.dispatch("PasswordResetRequestedEvent", { user, email, token: rawToken });
    }

    return {
      status: "RESET_LINK_SENT",
      message: "If an account exists, a reset link has been sent.",
      token: rawToken // In production, email handler will send this token to user
    };
  }

  /**
   * Reset user password using token.
   */
  async reset(credentials, callback) {
    const { email, token, password } = credentials;
    if (!email || !token || !password) {
      return { status: "INVALID_DATA", message: "Missing required fields." };
    }

    if (!this.tokenRepository) {
      return { status: "ERROR", message: "Token repository unavailable." };
    }

    const record = await this.tokenRepository.find(email);
    if (!record) {
      return { status: "INVALID_TOKEN", message: "Invalid or expired password reset token." };
    }

    if (new Date() > new Date(record.expires_at)) {
      await this.tokenRepository.delete(email);
      return { status: "EXPIRED_TOKEN", message: "Password reset token has expired." };
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expectedBuf = Buffer.from(record.hashed_token || record.hashedToken, "hex");
    const actualBuf = Buffer.from(hashedToken, "hex");

    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return { status: "INVALID_TOKEN", message: "Invalid or expired password reset token." };
    }

    const user = await this.userProvider.retrieveByCredentials({ email });
    if (!user) {
      return { status: "INVALID_USER", message: "User not found." };
    }

    const newHashedPassword = await this.passwordHasher.make(password);
    if (typeof callback === "function") {
      await callback(user, newHashedPassword);
    } else {
      if (typeof user.setPassword === "function") {
        user.setPassword(newHashedPassword);
      } else {
        user.password = newHashedPassword;
      }
      if (typeof user.save === "function") {
        await user.save();
      }
    }

    // Single-use token: delete after reset
    await this.tokenRepository.delete(email);

    if (this.eventDispatcher) {
      this.eventDispatcher.dispatch("PasswordResetCompletedEvent", { user, email });
    }

    return { status: "PASSWORD_RESET", message: "Password has been successfully reset." };
  }
}

export default PasswordBroker;
