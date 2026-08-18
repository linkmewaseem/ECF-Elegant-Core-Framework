import DriverRegistry from "./drivers/DriverRegistry.js";
import MemoryDriver from "./drivers/MemoryDriver.js";
import NullDriver from "./drivers/NullDriver.js";
import RedisDriver from "./drivers/RedisDriver.js";
import PusherDriver from "./drivers/PusherDriver.js";
import AblyDriver from "./drivers/AblyDriver.js";
import SocketIODriver from "./drivers/SocketIODriver.js";
import WebSocketDriver from "./drivers/WebSocketDriver.js";
import Channel from "./channels/Channel.js";
import PrivateChannel from "./channels/PrivateChannel.js";
import PresenceChannel from "./channels/PresenceChannel.js";
import BroadcasterAuthorizer from "./security/BroadcasterAuthorizer.js";
import BroadcastPipeline from "./pipeline/BroadcastPipeline.js";
import MemoryPresenceRepository from "./presence/MemoryPresenceRepository.js";
import BroadcastSerializer from "./serializers/BroadcastSerializer.js";
import ChannelHooks from "./hooks/ChannelHooks.js";
import RetryPolicy from "./retry/RetryPolicy.js";
import BroadcastFake from "./testing/BroadcastFake.js";

export class BroadcastManager {
  constructor(config = {}, container = null) {
    this.config = config;
    this.container = container;
    this.defaultDriverName = config.default || "memory";
    this.driverRegistry = new DriverRegistry();
    this.authorizer = new BroadcasterAuthorizer(config.secret || "ecf-broadcast-secret");
    this.pipeline = new BroadcastPipeline();
    this.presenceRepo = config.presenceRepository || new MemoryPresenceRepository();
    this.hooks = new ChannelHooks();
    this.retryPolicy = new RetryPolicy(config.retry?.type || "none", config.retry?.attempts || 1);

    this.registerBuiltInDrivers();
  }

  registerBuiltInDrivers() {
    this.driverRegistry.register("memory", () => new MemoryDriver());
    this.driverRegistry.register("null", () => new NullDriver());
    this.driverRegistry.register("redis", () => new RedisDriver(this.config.redisClient, this.config.redisOptions));
    this.driverRegistry.register("pusher", () => new PusherDriver(this.config.pusher || {}));
    this.driverRegistry.register("ably", () => new AblyDriver(this.config.ably || {}));
    this.driverRegistry.register("socket.io", () => new SocketIODriver(this.config.ioServer));
    this.driverRegistry.register("websocket", () => new WebSocketDriver(this.config.wsOptions || this.config));
  }

  driver(name = null) {
    const target = name || this.defaultDriverName;
    return this.driverRegistry.get(target);
  }

  extend(name, factory) {
    this.driverRegistry.register(name, factory);
    return this;
  }

  use(name) {
    this.defaultDriverName = name;
    return this;
  }

  channel(pattern, callback) {
    this.authorizer.channel(pattern, callback);
    return this;
  }

  private(name) {
    return new PrivateChannel(name);
  }

  presence(name) {
    return new PresenceChannel(name);
  }

  to(channels) {
    const list = Array.isArray(channels) ? channels : [channels];
    return {
      emit: async (event, payload = {}, metadata = {}) => {
        const results = [];
        for (const ch of list) {
          const res = await this.broadcast(ch, event, payload, metadata);
          results.push(res);
        }
        return results.length === 1 ? results[0] : results;
      },
    };
  }

  async broadcast(channel, event, payload = {}, metadata = {}) {
    const message = BroadcastSerializer.serialize(event, payload, channel, metadata);

    await this.hooks.trigger("beforePublish", message);

    const finalPublish = async (msg) => {
      const activeDriver = this.driver();
      return await this.retryPolicy.execute(async () => {
        return await activeDriver.publish(msg.channel, msg.event, msg.payload, {
          ...msg.metadata,
          headers: msg.headers,
          traceId: msg.traceId,
        });
      });
    };

    try {
      const result = await this.pipeline.send(message, finalPublish);
      await this.hooks.trigger("afterPublish", message, result);
      return result;
    } catch (err) {
      await this.hooks.trigger("onFailure", message, err);
      throw err;
    }
  }

  async authorize(channelName, user, socketId = null) {
    await this.hooks.trigger("onAuthorize", channelName, user, socketId);
    return await this.authorizer.authorize(channelName, user, socketId);
  }

  middleware(middlewares) {
    const list = Array.isArray(middlewares) ? middlewares : [middlewares];
    for (const mw of list) {
      this.pipeline.use(mw);
    }
    return this;
  }

  fake() {
    const fakeDriver = new BroadcastFake();
    this.driverRegistry.setInstance("fake", fakeDriver);
    this.driverRegistry.setInstance(this.defaultDriverName, fakeDriver);
    return fakeDriver;
  }
}

export default BroadcastManager;
