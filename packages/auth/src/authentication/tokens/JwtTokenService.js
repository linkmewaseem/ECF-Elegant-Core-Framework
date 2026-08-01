import crypto from "node:crypto";
import {
  InvalidTokenException,
  TokenExpiredException,
  TokenRevokedException
} from "../../exceptions/AuthException.js";

export class JwtTokenService {
  constructor(options = {}) {
    this.secret = options.secret || "ecf-secret-key-change-me-in-production";
    this.allowedAlgorithms = options.allowedAlgorithms || ["HS256", "RS256", "EdDSA"];
    this.issuer = options.issuer || null;
    this.audience = options.audience || null;
    this.leeway = options.leeway || 0; // seconds clock skew
    this.maxTokenSize = options.maxTokenSize || 8192; // 8 KB
    this.tokenStore = options.tokenStore || null;
    this.keyProvider = options.keyProvider || null;
  }

  /**
   * Encode JWT token with claims and algorithm.
   */
  encode(payload = {}, options = {}) {
    const alg = options.algorithm || "HS256";
    if (!this.allowedAlgorithms.includes(alg) || alg === "none") {
      throw new Error(`Algorithm ${alg} is not permitted.`);
    }

    const header = {
      alg,
      typ: "JWT",
      kid: options.kid || undefined
    };

    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
      iat: now,
      nbf: now,
      jti: crypto.randomBytes(16).toString("hex"),
      ...payload
    };

    if (options.expiresIn) {
      fullPayload.exp = now + options.expiresIn;
    }
    if (this.issuer) fullPayload.iss = this.issuer;
    if (this.audience) fullPayload.aud = this.audience;

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload));

    const signature = this.sign(`${encodedHeader}.${encodedPayload}`, alg, options.kid);
    const token = `${encodedHeader}.${encodedPayload}.${signature}`;

    if (token.length > this.maxTokenSize) {
      throw new Error("Token exceeds maximum payload size limit.");
    }

    return token;
  }

  /**
   * Decode and verify JWT token.
   */
  async decode(token, options = {}) {
    if (!token || typeof token !== "string" || token.length > this.maxTokenSize) {
      throw new InvalidTokenException("Invalid token size or format.");
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new InvalidTokenException("Malformed JWT structure.");
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    let header;
    let payload;

    try {
      header = JSON.parse(this.base64UrlDecode(encodedHeader));
      payload = JSON.parse(this.base64UrlDecode(encodedPayload));
    } catch {
      throw new InvalidTokenException("Failed to decode token JSON.");
    }

    const alg = header.alg;
    if (!alg || alg === "none" || !this.allowedAlgorithms.includes(alg)) {
      throw new InvalidTokenException(`Disallowed algorithm '${alg}'.`);
    }

    const expectedSignature = this.sign(`${encodedHeader}.${encodedPayload}`, alg, header.kid);

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw new InvalidTokenException("JWT signature verification failed.");
    }

    const now = Math.floor(Date.now() / 1000);
    const leeway = options.leeway ?? this.leeway;

    if (payload.exp && (now - leeway) >= payload.exp) {
      throw new TokenExpiredException("JWT token has expired.");
    }

    if (payload.nbf && (now + leeway) < payload.nbf) {
      throw new InvalidTokenException("JWT token is not active yet.");
    }

    if (this.issuer && payload.iss && payload.iss !== this.issuer) {
      throw new InvalidTokenException("JWT issuer mismatch.");
    }

    if (this.audience && payload.aud && payload.aud !== this.audience) {
      throw new InvalidTokenException("JWT audience mismatch.");
    }

    // Check Revocation if token store provided
    if (payload.jti && this.tokenStore) {
      const isRevoked = await this.tokenStore.isRevoked(payload.jti);
      if (isRevoked) {
        throw new TokenRevokedException("JWT token has been revoked.");
      }
    }

    return payload;
  }

  sign(content, alg, kid = null) {
    let key = this.secret;
    if (this.keyProvider && typeof this.keyProvider.getSigningKey === "function") {
      key = this.keyProvider.getSigningKey(kid) || this.secret;
    }

    if (alg === "HS256") {
      return this.base64UrlEncode(
        crypto.createHmac("sha256", key).update(content).digest()
      );
    } else if (alg === "RS256" || alg === "EdDSA") {
      const signAlgo = alg === "RS256" ? "SHA256" : undefined;
      const signer = crypto.createSign(signAlgo);
      signer.update(content);
      signer.end();
      return this.base64UrlEncode(signer.sign(key));
    } else {
      throw new Error(`Unsupported signing algorithm '${alg}'.`);
    }
  }

  base64UrlEncode(strOrBuffer) {
    const buf = Buffer.isBuffer(strOrBuffer) ? strOrBuffer : Buffer.from(strOrBuffer);
    return buf.toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }

  base64UrlDecode(str) {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    return Buffer.from(base64, "base64").toString("utf8");
  }
}

export default JwtTokenService;
