import test from "node:test";
import assert from "node:assert/strict";
import AuthContext from "../../src/contracts/IAuthContext.js";

test("AsyncLocalStorageAdversarial - Concurrent async isolation test under heavy load", async () => {
  const promises = [];
  const userCount = 50;

  for (let i = 0; i < userCount; i++) {
    const userId = `usr_${i}`;
    const promise = AuthContext.run({ user: { id: userId, email: `${userId}@ecf.dev` } }, async () => {
      // Simulate random async tick delays
      await new Promise(r => setTimeout(r, Math.floor(Math.random() * 20) + 1));
      const current = AuthContext.user();
      return current ? current.id : null;
    });
    promises.push({ expected: userId, promise });
  }

  for (const item of promises) {
    const actual = await item.promise;
    assert.equal(actual, item.expected, `AuthContext leaked state for user ${item.expected}`);
  }
});
