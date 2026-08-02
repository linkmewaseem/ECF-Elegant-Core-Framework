import { createHmac } from "node:crypto";
import CompiledPattern from "../channels/CompiledPattern.js";

export class BroadcasterAuthorizer {
  constructor(secretKey = "ecf-broadcast-secret") {
    this.secretKey = secretKey;
    this.channelRules = [];
    this.rateLimitMap = new Map();
  }

  channel(pattern, callback) {
    this.channelRules.push({
      pattern,
      compiled: new CompiledPattern(pattern),
      callback,
    });
    return this;
  }

  async authorize(channelName, user, socketId = null, extraData = {}) {
    const normChannel = channelName.startsWith("private-")
      ? channelName.slice(8)
      : channelName.startsWith("presence-")
      ? channelName.slice(9)
      : channelName;

    for (const rule of this.channelRules) {
      const params = rule.compiled.match(normChannel);
      if (params !== null) {
        const paramValues = Object.values(params);
        const authorized = await rule.callback(user, ...paramValues);
        if (!authorized) {
          return { authorized: false, reason: "Access denied by channel authorization callback" };
        }
        return {
          authorized: true,
          channel: channelName,
          user,
          presenceData: typeof authorized === "object" ? authorized : { id: user.id || user.user_id },
        };
      }
    }

    return { authorized: false, reason: "No channel authorization rule matched" };
  }

  verifySignature(stringToSign, signature) {
    const computed = createHmac("sha256", this.secretKey).update(stringToSign).digest("hex");
    return computed === signature;
  }

  generateSignature(stringToSign) {
    return createHmac("sha256", this.secretKey).update(stringToSign).digest("hex");
  }

  checkRateLimit(identifier, limit = 100, windowMs = 60000) {
    const now = Date.now();
    let record = this.rateLimitMap.get(identifier);
    if (!record || now - record.startTime > windowMs) {
      record = { startTime: now, count: 0 };
    }
    record.count++;
    this.rateLimitMap.set(identifier, record);
    return record.count <= limit;
  }
}

export default BroadcasterAuthorizer;
