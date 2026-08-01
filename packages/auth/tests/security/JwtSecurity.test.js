import test from "node:test";
import assert from "node:assert/strict";
import JwtTokenService from "../../src/authentication/tokens/JwtTokenService.js";
import { InvalidTokenException, TokenExpiredException } from "../../src/exceptions/AuthException.js";

test("JWT Security - rejects 'none' algorithm and unapproved algorithms", async () => {
  const jwt = new JwtTokenService({ secret: "test-secret", allowedAlgorithms: ["HS256"] });

  assert.throws(() => {
    jwt.encode({ sub: "123" }, { algorithm: "none" });
  }, /Algorithm none is not permitted/);
});

test("JWT Security - verifies token signature and rejects tampered token", async () => {
  const jwt = new JwtTokenService({ secret: "test-secret" });
  const token = jwt.encode({ sub: "user-99" });

  const decoded = await jwt.decode(token);
  assert.equal(decoded.sub, "user-99");

  // Tamper token payload
  const parts = token.split(".");
  const tamperedPayload = Buffer.from(JSON.stringify({ sub: "hacked-user" })).toString("base64url");
  const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

  await assert.rejects(async () => {
    await jwt.decode(tamperedToken);
  }, InvalidTokenException);
});

test("JWT Security - rejects expired tokens", async () => {
  const jwt = new JwtTokenService({ secret: "test-secret" });
  const token = jwt.encode({ sub: "user-1" }, { expiresIn: -10 }); // Expired 10s ago

  await assert.rejects(async () => {
    await jwt.decode(token);
  }, TokenExpiredException);
});
