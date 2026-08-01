export class NotificationPipeline {
  constructor(middlewares = []) {
    this.middlewares = middlewares;
  }

  async process(notification, notifiable, destinationChannel) {
    let index = 0;

    const next = async (notif, target, channel) => {
      if (index >= this.middlewares.length) {
        return { allowed: true };
      }
      const middleware = this.middlewares[index++];
      if (typeof middleware.handle === "function") {
        return middleware.handle(notif, target, next);
      }
      return next(notif, target, channel);
    };

    return next(notification, notifiable, destinationChannel);
  }
}

export default NotificationPipeline;
