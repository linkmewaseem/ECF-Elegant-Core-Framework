export class BroadcastFacade {
  static instance = null;

  static setInstance(manager) {
    BroadcastFacade.instance = manager;
  }

  static getInstance() {
    if (!BroadcastFacade.instance) {
      throw new Error("BroadcastFacade instance has not been bound to IoC container.");
    }
    return BroadcastFacade.instance;
  }

  static channel(pattern, callback) {
    return BroadcastFacade.getInstance().channel(pattern, callback);
  }

  static private(name) {
    return BroadcastFacade.getInstance().private(name);
  }

  static presence(name) {
    return BroadcastFacade.getInstance().presence(name);
  }

  static to(channels) {
    return BroadcastFacade.getInstance().to(channels);
  }

  static broadcast(channel, event, payload, metadata) {
    return BroadcastFacade.getInstance().broadcast(channel, event, payload, metadata);
  }

  static extend(name, factory) {
    return BroadcastFacade.getInstance().extend(name, factory);
  }

  static use(name) {
    return BroadcastFacade.getInstance().use(name);
  }

  static middleware(middlewares) {
    return BroadcastFacade.getInstance().middleware(middlewares);
  }

  static fake() {
    return BroadcastFacade.getInstance().fake();
  }
}

export const Broadcast = BroadcastFacade;
export default BroadcastFacade;
