import INotificationManager from "../contracts/INotificationManager.js";
import ChannelRegistry from "../channels/ChannelRegistry.js";
import MailChannel from "../channels/MailChannel.js";
import DatabaseChannel from "../channels/DatabaseChannel.js";
import SlackChannel, { LogChannel, NullChannel } from "../channels/SlackChannel.js";
import WebhookChannel from "../channels/WebhookChannel.js";
import BroadcastChannel from "../channels/BroadcastChannel.js";
import PreferenceEngine from "../preferences/PreferenceEngine.js";
import NotificationPipeline from "../middleware/NotificationPipeline.js";
import NotificationTestingFake from "../testing/NotificationTestingFake.js";
import SendQueuedNotificationJob from "../notification/SendQueuedNotificationJob.js";

export class NotificationManager extends INotificationManager {
  constructor(app = null) {
    super();
    this.app = app;
    this.registry = new ChannelRegistry();
    this.preferenceEngine = new PreferenceEngine();
    this.fakeHarness = null;

    this.registerDefaultChannels();
  }

  registerDefaultChannels() {
    this.registry.register("mail", new MailChannel(this.app?.has("mail") ? this.app.make("mail") : null));
    this.registry.register("database", new DatabaseChannel());
    this.registry.register("slack", new SlackChannel());
    this.registry.register("webhook", new WebhookChannel());
    this.registry.register("log", new LogChannel());
    this.registry.register("null", new NullChannel());
    this.registry.register("broadcast", new BroadcastChannel(this.app?.has("broadcast") ? this.app.make("broadcast") : null));
  }

  channel(name) {
    return this.registry.get(name);
  }

  async send(notifiables, notification) {
    if (this.fakeHarness) {
      return this.fakeHarness.send(notifiables, notification);
    }

    if (notification.shouldQueue) {
      return SendQueuedNotificationJob.dispatch(notifiables, notification);
    }

    return this.sendNow(notifiables, notification);
  }

  async sendNow(notifiables, notification, explicitChannels = null) {
    if (this.fakeHarness) {
      return this.fakeHarness.send(notifiables, notification);
    }

    const targets = Array.isArray(notifiables) ? notifiables : [notifiables];
    const results = [];

    for (const notifiable of targets) {
      let channels = explicitChannels || notification.via(notifiable);
      channels = this.preferenceEngine.filterChannels(notifiable, notification, channels);

      const middlewares = typeof notification.middleware === "function" ? notification.middleware() : [];
      const pipeline = new NotificationPipeline(middlewares);

      for (const channelName of channels) {
        const pipelineRes = await pipeline.process(notification, notifiable, channelName);
        if (pipelineRes && pipelineRes.allowed === false) continue;

        const channel = this.registry.get(channelName);
        if (channel) {
          const res = await channel.send(notifiable, notification);
          results.push({ channel: channelName, result: res });
        }
      }
    }
    return results;
  }

  fake() {
    this.fakeHarness = new NotificationTestingFake();
    return this.fakeHarness;
  }
}

export default NotificationManager;
