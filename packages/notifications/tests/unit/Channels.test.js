import test from "node:test";
import assert from "node:assert/strict";
import MailChannel from "../../src/channels/MailChannel.js";
import DatabaseChannel from "../../src/channels/DatabaseChannel.js";
import SlackChannel, { LogChannel, NullChannel } from "../../src/channels/SlackChannel.js";
import Notification from "../../src/notification/Notification.js";

class TestChannelNotification extends Notification {
  toMail() { return { subject: "Mail Subject" }; }
  toDatabase() { return { message: "Database notification" }; }
  toSlack() { return { text: "Slack alert" }; }
}

test("Channels - MailChannel, DatabaseChannel, SlackChannel, LogChannel delivery", async () => {
  const notifiable = { id: 42, email: "user@example.com", routeNotificationFor: (ch) => ch === "database" ? 42 : "user@example.com" };
  const notification = new TestChannelNotification();

  const mailChan = new MailChannel();
  const dbChan = new DatabaseChannel();
  const slackChan = new SlackChannel();
  const logChan = new LogChannel();

  const mailRes = await mailChan.send(notifiable, notification);
  const dbRes = await dbChan.send(notifiable, notification);
  const slackRes = await slackChan.send(notifiable, notification);
  const logRes = await logChan.send(notifiable, notification);

  assert.equal(mailRes.sent, true);
  assert.equal(dbRes.notifiableId, 42);
  assert.equal(slackRes.sent, true);
  assert.equal(logRes.sent, true);
});
