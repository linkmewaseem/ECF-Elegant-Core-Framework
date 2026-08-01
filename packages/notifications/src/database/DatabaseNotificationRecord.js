export class DatabaseNotificationRecord {
  constructor(data = {}) {
    this.id = data.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.type = data.type || "Notification";
    this.notifiableType = data.notifiableType || "User";
    this.notifiableId = data.notifiableId || null;
    this.data = data.data || {};
    this.readAt = data.readAt || null;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  }

  markAsRead() {
    this.readAt = new Date();
    return this;
  }

  markAsUnread() {
    this.readAt = null;
    return this;
  }

  isRead() {
    return this.readAt !== null;
  }

  isUnread() {
    return this.readAt === null;
  }
}

export default DatabaseNotificationRecord;
