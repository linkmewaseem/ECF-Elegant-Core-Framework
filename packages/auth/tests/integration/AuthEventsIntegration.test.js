import test from "node:test";
import assert from "node:assert/strict";
import SessionGuard from "../../src/authentication/guards/SessionGuard.js";
import MemoryUserProvider from "../../src/authentication/providers/MemoryUserProvider.js";
import SessionManager from "../../src/authentication/sessions/SessionManager.js";

class MockEventDispatcher {
  constructor() {
    this.events = [];
  }
  dispatch(eventName, payload) {
    this.events.push({ eventName, payload });
  }
}

test("AuthEventsIntegration - Guard dispatches Login, Logout, and FailedLogin events", async () => {
  const dispatcher = new MockEventDispatcher();
  const provider = new MemoryUserProvider([{ id: "usr_1", username: "alex", password: "SecretPassword123" }]);
  const sessionManager = new SessionManager();
  const guard = new SessionGuard("web", provider, sessionManager, null, dispatcher);

  // Failed Login Attempt
  const failed = await guard.attempt({ username: "alex", password: "WrongPassword" });
  assert.equal(failed, false);
  assert.equal(dispatcher.events.length, 1);
  assert.equal(dispatcher.events[0].eventName, "FailedLoginEvent");

  // Successful Login
  const success = await guard.attempt({ username: "alex", password: "SecretPassword123" });
  assert.equal(success, true);
  assert.equal(dispatcher.events.length, 2);
  assert.equal(dispatcher.events[1].eventName, "LoginEvent");
  assert.equal(dispatcher.events[1].payload.user.id, "usr_1");

  // Logout
  await guard.logout();
  assert.equal(dispatcher.events.length, 3);
  assert.equal(dispatcher.events[2].eventName, "LogoutEvent");
});
