import test from "node:test";
import assert from "node:assert/strict";
import DatabaseNotificationRecord from "../../src/database/DatabaseNotificationRecord.js";

test("DatabaseNotificationRecord - read and unread status tracking", () => {
  const record = new DatabaseNotificationRecord({
    type: "OrderShippedNotification",
    notifiableId: 42,
    data: { orderId: 101 }
  });

  assert.equal(record.isUnread(), true);
  assert.equal(record.isRead(), false);

  record.markAsRead();
  assert.equal(record.isUnread(), false);
  assert.equal(record.isRead(), true);

  record.markAsUnread();
  assert.equal(record.isUnread(), true);
});
