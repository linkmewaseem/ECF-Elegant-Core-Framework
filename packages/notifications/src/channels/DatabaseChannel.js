import INotificationChannel from "../contracts/INotificationChannel.js";
import DatabaseNotificationRecord from "../database/DatabaseNotificationRecord.js";

const memoryDatabaseStore = [];

export class DatabaseChannel extends INotificationChannel {
  name() {
    return "database";
  }

  async send(notifiable, notification) {
    if (typeof notification.toDatabase !== "function") return false;

    const data = notification.toDatabase(notifiable);
    const notifiableId = typeof notifiable.routeNotificationFor === "function" ? notifiable.routeNotificationFor("database") : notifiable.id;

    const record = new DatabaseNotificationRecord({
      type: notification.constructor.name,
      notifiableId,
      data
    });

    memoryDatabaseStore.push(record);
    return record;
  }

  static getStore() {
    return memoryDatabaseStore;
  }
}

export default DatabaseChannel;
