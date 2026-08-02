import INotificationChannel from "../contracts/INotificationChannel.js";

export class BroadcastChannel extends INotificationChannel {
  constructor(broadcastManager = null) {
    super();
    this.broadcastManager = broadcastManager;
  }

  name() {
    return "broadcast";
  }

  async send(notifiable, notification) {
    if (typeof notification.toBroadcast !== "function") return false;

    const message = notification.toBroadcast(notifiable);
    let channels = null;

    if (typeof notification.broadcastOn === "function") {
      channels = notification.broadcastOn();
    } else if (typeof notifiable.routeNotificationFor === "function") {
      channels = notifiable.routeNotificationFor("broadcast");
    }

    if (this.broadcastManager && channels) {
      const channelList = Array.isArray(channels) ? channels : [channels];
      const eventName = notification.constructor.name;
      return await this.broadcastManager.to(channelList).emit(eventName, message);
    }

    return { sent: true, channel: "broadcast", recipient: channels, message };
  }
}

export default BroadcastChannel;
