export class NotificationException extends Error {
  constructor(message = "Notification exception.", status = 500, code = "ERR_NOTIFICATION") {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
  }
}

export class ChannelDeliveryException extends NotificationException {
  constructor(channelName, reason) {
    super(`Notification channel '${channelName}' failed: ${reason}`, 500, "ERR_CHANNEL_DELIVERY");
    this.channelName = channelName;
  }
}

export class NotificationValidationException extends NotificationException {
  constructor(reason = "Notification routing or preference validation failed.") {
    super(`Notification validation error: ${reason}`, 422, "ERR_NOTIFICATION_VALIDATION");
  }
}

export default NotificationException;
