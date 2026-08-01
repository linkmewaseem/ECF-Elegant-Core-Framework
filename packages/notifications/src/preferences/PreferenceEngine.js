export class PreferenceEngine {
  filterChannels(notifiable, notification, channels = []) {
    const preferences = typeof notifiable.notificationPreferences === "function" ? notifiable.notificationPreferences() : {};
    const topic = notification.constructor ? notification.constructor.name : "default";

    return channels.filter(channel => {
      // Check channel level preference override (e.g. preferences.mail === false)
      if (preferences[channel] === false) return false;
      // Check topic level preference override (e.g. preferences[topic]?.mail === false)
      if (preferences[topic] && preferences[topic][channel] === false) return false;
      return true;
    });
  }
}

export default PreferenceEngine;
