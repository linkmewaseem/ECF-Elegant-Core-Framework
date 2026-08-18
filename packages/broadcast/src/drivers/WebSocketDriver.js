import IBroadcastDriver from "../contracts/IBroadcastDriver.js";
import { WebSocketServer, WebSocket } from "ws";

/**
 * Native WebSocket Broadcaster Driver for ECF Framework.
 * Implements full-duplex real-time communication with channel-based
 * subscription, presence tracking, and HTML fragment distribution.
 */
export class WebSocketDriver extends IBroadcastDriver {
  constructor(options = {}) {
    super();
    this.options = options;
    this.wss = null;
    this.clients = new Map(); // socket -> { id, user, channels: Set<string> }
    this.channelSubscribers = new Map(); // channelName -> Set<socket>
    this.userSockets = new Map(); // userId -> Set<socket>
    this.hooks = new Map(); // eventName -> Array<callback>

    if (options.server || options.port) {
      this.attach(options.server, options);
    }
  }

  /**
   * Attach the WebSocket server to an existing HTTP server or port.
   * @param {import("http").Server} [httpServer]
   * @param {Object} [opts]
   */
  attach(httpServer = null, opts = {}) {
    if (this.wss) return this;

    const wssOptions = {
      ...(httpServer ? { server: httpServer } : { port: opts.port || 3001 }),
      path: opts.path || "/ws",
      ...opts
    };

    this.wss = new WebSocketServer(wssOptions);
    this.setupServerEvents();
    return this;
  }

  /**
   * Internal connection and message event handlers.
   */
  setupServerEvents() {
    this.wss.on("connection", (ws, req) => {
      const socketId = `ws_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
      const clientState = {
        id: socketId,
        user: null,
        channels: new Set(),
        connectedAt: Date.now()
      };

      this.clients.set(ws, clientState);

      // Send greeting / handshake
      this.send(ws, "system.connected", {
        socketId,
        message: "Connected to ECF Real-Time Broadcast Engine",
        timestamp: Date.now()
      });

      ws.on("message", (raw) => {
        try {
          const message = JSON.parse(raw.toString());
          this.handleClientMessage(ws, message);
        } catch (err) {
          this.send(ws, "system.error", { error: "Invalid JSON payload" });
        }
      });

      ws.on("close", () => {
        this.handleClientDisconnect(ws);
      });

      ws.on("error", (err) => {
        this.handleClientDisconnect(ws);
      });
    });
  }

  /**
   * Route incoming client message actions (subscribe, unsubscribe, auth, typing).
   */
  handleClientMessage(ws, message) {
    const client = this.clients.get(ws);
    if (!client) return;

    const { action, channel, event, data } = message;

    switch (action) {
      case "auth":
      case "identify": {
        if (data?.user) {
          client.user = data.user;
          const userId = String(data.user.id);
          if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
          }
          this.userSockets.get(userId).add(ws);

          // Auto-join user-specific private channel & global presence channel
          this.subscribeSocketToChannel(ws, `user:${userId}`);
          this.subscribeSocketToChannel(ws, "presence:online");

          // Broadcast user online to everyone
          this.publish("presence:online", "presence.online", {
            userId: data.user.id,
            user: data.user,
            timestamp: Date.now()
          });

          this.send(ws, "auth.success", { user: data.user, socketId: client.id });
        }
        break;
      }

      case "subscribe": {
        if (channel) {
          this.subscribeSocketToChannel(ws, channel);
          this.send(ws, "subscription.success", { channel });
        }
        break;
      }

      case "unsubscribe": {
        if (channel) {
          this.unsubscribeSocketFromChannel(ws, channel);
          this.send(ws, "unsubscription.success", { channel });
        }
        break;
      }

      case "typing": {
        if (channel && client.user) {
          this.publish(channel, data?.isTyping ? "typing.start" : "typing.stop", {
            channel,
            user: client.user,
            conversationId: data?.conversationId || channel.replace("conversation:", "")
          }, { excludeSocket: ws });
        }
        break;
      }

      case "ping": {
        this.send(ws, "pong", { time: Date.now() });
        break;
      }

      default: {
        this.fireHook("client_message", { ws, client, message });
      }
    }
  }

  /**
   * Clean up on socket disconnect.
   */
  handleClientDisconnect(ws) {
    const client = this.clients.get(ws);
    if (!client) return;

    // Remove from channels
    for (const channel of client.channels) {
      const subscribers = this.channelSubscribers.get(channel);
      if (subscribers) {
        subscribers.delete(ws);
        if (subscribers.size === 0) this.channelSubscribers.delete(channel);
      }
    }

    // Remove from user sockets
    if (client.user?.id) {
      const userId = String(client.user.id);
      const userSockets = this.userSockets.get(userId);
      if (userSockets) {
        userSockets.delete(ws);
        if (userSockets.size === 0) {
          this.userSockets.delete(userId);
          // Broadcast offline if no more open tabs/connections
          this.publish("presence:online", "presence.offline", {
            userId: client.user.id,
            user: client.user,
            timestamp: Date.now()
          });
        }
      }
    }

    this.clients.delete(ws);
  }

  subscribeSocketToChannel(ws, channel) {
    const client = this.clients.get(ws);
    if (!client) return;

    client.channels.add(channel);
    if (!this.channelSubscribers.has(channel)) {
      this.channelSubscribers.set(channel, new Set());
    }
    this.channelSubscribers.get(channel).add(ws);
  }

  unsubscribeSocketFromChannel(ws, channel) {
    const client = this.clients.get(ws);
    if (!client) return;

    client.channels.delete(channel);
    const subscribers = this.channelSubscribers.get(channel);
    if (subscribers) {
      subscribers.delete(ws);
      if (subscribers.size === 0) this.channelSubscribers.delete(channel);
    }
  }

  /**
   * Broadcast an event and payload to a specific channel.
   * @param {string} channel
   * @param {string} event
   * @param {any} payload (Can contain rendered HTML fragment `html` or data object)
   * @param {Object} [metadata]
   */
  async publish(channel, event, payload, metadata = {}) {
    const subscribers = this.channelSubscribers.get(channel);
    if (!subscribers || subscribers.size === 0) {
      return { success: true, listenersCount: 0, channel, event };
    }

    const frame = JSON.stringify({
      channel,
      event,
      payload,
      metadata: {
        timestamp: Date.now(),
        ...metadata
      }
    });

    let count = 0;
    const exclude = metadata.excludeSocket || null;

    for (const ws of subscribers) {
      if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
        ws.send(frame);
        count++;
      }
    }

    return { success: true, listenersCount: count, channel, event };
  }

  /**
   * Direct message to a specific authenticated user.
   */
  async toUser(userId, event, payload, metadata = {}) {
    return this.publish(`user:${userId}`, event, payload, metadata);
  }

  /**
   * Send JSON payload to a single socket.
   */
  send(ws, event, payload = {}) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event, payload, timestamp: Date.now() }));
    }
  }

  on(eventName, callback) {
    if (!this.hooks.has(eventName)) this.hooks.set(eventName, []);
    this.hooks.get(eventName).push(callback);
  }

  fireHook(eventName, data) {
    const callbacks = this.hooks.get(eventName) || [];
    for (const cb of callbacks) cb(data);
  }

  async authorize(channel, socketId, options = {}) {
    return { authorized: true, channel, socketId };
  }

  async subscribe(channel, callback) {
    return true;
  }

  async unsubscribe(channel) {
    return true;
  }

  close() {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
  }
}

export default WebSocketDriver;
