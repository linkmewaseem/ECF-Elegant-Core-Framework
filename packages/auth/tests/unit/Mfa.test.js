import test from "node:test";
import assert from "node:assert/strict";
import TotpProvider from "../../src/mfa/TotpProvider.js";
import RecoveryCodeProvider from "../../src/mfa/RecoveryCodeProvider.js";

test("TotpProvider - generates secret, encrypts/decrypts, verifies valid TOTP code", () => {
  const totp = new TotpProvider();
  const user = { email: "test@ecf.dev" };
  const secretData = totp.generateSecret(user);

  assert.ok(secretData.secret);
  assert.ok(secretData.encryptedSecret);
  assert.ok(secretData.uri.includes("otpauth://totp/"));

  const nowStep = Math.floor(Date.now() / 1000 / 30);
  const code = totp.generateHOTP(secretData.secret, nowStep);

  const result = totp.verifyCode(secretData.encryptedSecret, code);
  assert.equal(result.valid, true);

  const badResult = totp.verifyCode(secretData.encryptedSecret, "000000");
  assert.equal(badResult.valid, false);
});

test("RecoveryCodeProvider - generates and consumes single-use recovery codes", () => {
  const recovery = new RecoveryCodeProvider();
  const { plainCodes, hashedCodes } = recovery.generateSecret({}, 5);

  assert.equal(plainCodes.length, 5);
  assert.equal(hashedCodes.length, 5);

  const firstCode = plainCodes[0];
  const verifyResult = recovery.verifyCode(hashedCodes, firstCode);

  assert.equal(verifyResult.valid, true);
  assert.equal(verifyResult.remainingCodes.length, 4);

  // Attempt replaying the same consumed code
  const replayResult = recovery.verifyCode(verifyResult.remainingCodes, firstCode);
  assert.equal(replayResult.valid, false);
});
