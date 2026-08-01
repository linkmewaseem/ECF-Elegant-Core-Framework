import test from "node:test";
import assert from "node:assert/strict";
import Notification from "../../src/notification/Notification.js";
import NotificationTestingFake from "../../src/testing/NotificationTestingFake.js";

class InvoicePaidNotification extends Notification {}
class SystemAlertNotification extends Notification {}

test("NotificationTestingFake - assertions for sent notifications", async () => {
  const fake = new NotificationTestingFake();
  const user = { id: 42 };

  await fake.send(user, new InvoicePaidNotification());

  fake.assertSentTo(user, InvoicePaidNotification);
  fake.assertNotSentTo(user, SystemAlertNotification);
  fake.assertCount(1);
});
