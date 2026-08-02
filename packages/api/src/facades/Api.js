export class ApiFacade {
  static instance = null;

  static setInstance(manager) {
    ApiFacade.instance = manager;
  }

  static getInstance() {
    if (!ApiFacade.instance) {
      throw new Error("ApiFacade instance has not been bound to IoC container.");
    }
    return ApiFacade.instance;
  }

  static resource(data, resourceClass) {
    return ApiFacade.getInstance().resource(data, resourceClass);
  }

  static collection(data, resourceClass) {
    return ApiFacade.getInstance().collection(data, resourceClass);
  }

  static version(ver) {
    return ApiFacade.getInstance().version(ver);
  }

  static profile(name) {
    return ApiFacade.getInstance().profile(name);
  }

  static ok(data, headers) {
    return ApiFacade.getInstance().ok(data, headers);
  }

  static created(data, headers) {
    return ApiFacade.getInstance().created(data, headers);
  }

  static accepted(data, headers) {
    return ApiFacade.getInstance().accepted(data, headers);
  }

  static noContent(headers) {
    return ApiFacade.getInstance().noContent(headers);
  }

  static error(message, status, details) {
    return ApiFacade.getInstance().error(message, status, details);
  }

  static validation(errors, message) {
    return ApiFacade.getInstance().validation(errors, message);
  }

  static notFound(message) {
    return ApiFacade.getInstance().notFound(message);
  }

  static unauthorized(message) {
    return ApiFacade.getInstance().unauthorized(message);
  }

  static forbidden(message) {
    return ApiFacade.getInstance().forbidden(message);
  }

  static fake() {
    return ApiFacade.getInstance().fake();
  }
}

export const Api = ApiFacade;
export default ApiFacade;
