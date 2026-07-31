/**
 * Event Bus for HTTP Request Lifecycle Events.
 * Dispatches: RequestReceived, RouteMatched, MiddlewareStarting, ControllerResolving, ControllerResolved, ResponseSending, ResponseSent, ExceptionThrown.
 */
export class HttpEventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to a lifecycle event.
   * @param {string} eventName
   * @param {Function} callback
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
    return this;
  }

  /**
   * Dispatch an HTTP lifecycle event asynchronously.
   * @param {string} eventName
   * @param {object} payload
   */
  async emit(eventName, payload = {}) {
    const handlers = this.listeners.get(eventName) || [];
    for (const handler of handlers) {
      await handler(payload);
    }
  }
}

export const HttpEvents = Object.freeze({
  REQUEST_RECEIVED: 'RequestReceived',
  ROUTE_MATCHED: 'RouteMatched',
  MIDDLEWARE_STARTING: 'MiddlewareStarting',
  CONTROLLER_RESOLVING: 'ControllerResolving',
  CONTROLLER_RESOLVED: 'ControllerResolved',
  RESPONSE_SENDING: 'ResponseSending',
  RESPONSE_SENT: 'ResponseSent',
  EXCEPTION_THROWN: 'ExceptionThrown'
});
