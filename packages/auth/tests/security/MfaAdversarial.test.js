import test from "node:test";
import assert from "node:assert/strict";
import TotpProvider from "../../src/mfa/TotpProvider.js";

test("MfaAdversarial - Step replay protection prevents reuse of same TOTP code in same time step", () => {
  const totp = new TotpProvider();
  const user = { email: "mfa@ecf.dev" };
  const secretData = totp.generateSecret(user);

  const nowStep = Math.floor(Date.now() / 1000 / 30);
  const code = totp.generateHOTP(secretData.secret, nowStep);

  // 1st verification succeeds
  const res1 = totp.verifyCode(secretData.encryptedSecret, code);
  assert.equal(res1.valid, true);

  // 2nd verification with lastVerifiedStep passes step limit -> Replayed code rejected!
  const res2 = totp.verifyCode(secretData.encryptedSecret, code, res1.verifiedStep);
  assert.equal(res2.valid, false, "Replaying same TOTP code in same time step MUST be rejected");
});
