import test from "node:test";
import assert from "node:assert/strict";
import Notification from "../../src/notification/Notification.js";
import DigestNotification from "../../src/notification/DigestNotification.js";

class WelcomeUserNotification extends Notification {
  via() {
    return ["mail", "database"];
  }
}

test("Notification - locale, via channels, and digest aggregation", () => {
  const notif = new WelcomeUserNotification().locale("ur");
  assert.equal(notif.currentLocale, "ur");
  assert.deepEqual(notif.via({}), ["mail", "database"]);

  const digest = new DigestNotification([notif]);
  assert.equal(digest.notifications.length, 1);
});
