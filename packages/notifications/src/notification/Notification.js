import INotification from "../contracts/INotification.js";

export class Notification extends INotification {
  constructor() {
    super();
    this.currentLocale = "en";
    this.customIdempotencyKey = null;
  }

  via(notifiable) {
    return ["mail"];
  }

  locale(loc) {
    this.currentLocale = loc;
    return this;
  }

  setIdempotencyKey(key) {
    this.customIdempotencyKey = key;
    return this;
  }

  idempotencyKey() {
    return this.customIdempotencyKey || `${this.constructor.name}_${Date.now()}`;
  }

  middleware() {
    return [];
  }
}

export default Notification;
