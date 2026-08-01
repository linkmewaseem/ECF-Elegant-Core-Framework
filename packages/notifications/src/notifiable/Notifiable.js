export const NotifiableMixin = {
  notify(notification, manager = null) {
    if (manager) {
      return manager.send(this, notification);
    }
    return true;
  },

  routeNotificationFor(channel) {
    if (channel === "mail") return this.email || this.mail;
    if (channel === "database") return this.id;
    if (channel === "slack") return this.slackWebhookUrl || null;
    return null;
  },

  notificationPreferences() {
    return this.preferences || {};
  }
};

export default NotifiableMixin;
