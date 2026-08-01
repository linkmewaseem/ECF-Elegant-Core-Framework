import INotifiable from "../contracts/INotifiable.js";

export class AnonymousNotifiable extends INotifiable {
  constructor() {
    super();
    this.routes = new Map();
  }

  route(channel, target) {
    this.routes.set(channel, target);
    return this;
  }

  routeNotificationFor(channel) {
    return this.routes.get(channel) || null;
  }

  notify(notification, manager = null) {
    if (manager) {
      return manager.send(this, notification);
    }
    return true;
  }
}

export default AnonymousNotifiable;
