import test from "node:test";
import assert from "node:assert/strict";
import JwtTokenService from "../../src/authentication/tokens/JwtTokenService.js";
import ITokenStore from "../../src/contracts/ITokenStore.js";
import {
  InvalidTokenException,
  TokenExpiredException,
  TokenRevokedException
} from "../../src/exceptions/AuthException.js";

class MockTokenStore extends ITokenStore {
  constructor() {
    super();
    this.revoked = new Set();
  }
  async isRevoked(tokenId) {
    return this.revoked.has(tokenId);
  }
  async revoke(tokenId) {
    this.revoked.add(tokenId);
  }
}

test("JwtAdversarial - Malformed structure and corrupted segments", async () => {
  const jwt = new JwtTokenService({ secret: "test-secret" });

  await assert.rejects(async () => {
    await jwt.decode("invalid.single.string.with.too.many.dots");
  }, InvalidTokenException);

  await assert.rejects(async () => {
    await jwt.decode("only_one_part");
  }, InvalidTokenException);

  await assert.rejects(async () => {
    await jwt.decode("invalid_base64.invalid_base64.signature");
  }, InvalidTokenException);
});

test("JwtAdversarial - Payload size limit enforcement (>8KB)", async () => {
  const jwt = new JwtTokenService({ secret: "test-secret", maxTokenSize: 1024 }); // 1KB limit
  const hugePayload = { data: "x".repeat(2000) };

  assert.throws(() => {
    jwt.encode(hugePayload);
  }, /Token exceeds maximum payload size limit/);
});

test("JwtAdversarial - Signature byte tampering detection", async () => {
  const jwt = new JwtTokenService({ secret: "test-secret" });
  const token = jwt.encode({ sub: "user-1" });

  const parts = token.split(".");
  const corruptedSignature = parts[2].slice(0, -2) + "xx";
  const tamperedToken = `${parts[0]}.${parts[1]}.${corruptedSignature}`;

  await assert.rejects(async () => {
    await jwt.decode(tamperedToken);
  }, InvalidTokenException);
});

test("JwtAdversarial - Token revocation store integration", async () => {
  const tokenStore = new MockTokenStore();
  const jwt = new JwtTokenService({ secret: "test-secret", tokenStore });

  const token = jwt.encode({ sub: "user-100" });
  const decoded = await jwt.decode(token);
  assert.ok(decoded.jti);

  // Revoke JTI
  await tokenStore.revoke(decoded.jti);

  await assert.rejects(async () => {
    await jwt.decode(token);
  }, TokenRevokedException);
});

test("JwtAdversarial - Clock skew leeway edge cases", async () => {
  const jwt = new JwtTokenService({ secret: "test-secret", leeway: 5 }); // 5 sec leeway
  const now = Math.floor(Date.now() / 1000);

  // Token expired 3 seconds ago -> Valid due to 5s leeway
  const payload = { sub: "user-1", exp: now - 3 };
  const token = jwt.encode(payload);

  const decoded = await jwt.decode(token);
  assert.equal(decoded.sub, "user-1");
});
