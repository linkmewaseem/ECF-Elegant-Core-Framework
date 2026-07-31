import ListenerRegistry from "./ListenerRegistry.js";
import EventContext from "./EventContext.js";
import Event from "./Event.js";

export class EventDispatcher {
  constructor(container = null) {
    this.container = container;
    this.registry = new ListenerRegistry();
    this.busMiddleware = [];
    this.devtoolsHooks = {
      beforeDispatch: [],
      afterDispatch: [],
      listenerStart: [],
      listenerEnd: [],
      exception: [],
    };
  }

  listen(eventName, listener, priority = 0) {
    this.registry.listen(eventName, listener, priority);
    return this;
  }

  forget(eventName) {
    this.registry.forget(eventName);
    return this;
  }

  use(middlewareFn) {
    this.busMiddleware.push(middlewareFn);
    return this;
  }

  onDevTools(eventHookName, callback) {
    if (this.devtoolsHooks[eventHookName]) {
      this.devtoolsHooks[eventHookName].push(callback);
    }
  }

  async dispatch(eventOrName, payload = {}, options = {}) {
    let eventName;
    let eventInstance;
    let context;

    if (eventOrName instanceof Event) {
      eventInstance = eventOrName;
      eventName = eventInstance.name;
      context = eventInstance.context;
    } else if (typeof eventOrName === "object" && eventOrName.constructor) {
      eventInstance = eventOrName;
      eventName = eventInstance.constructor.name;
      context = eventInstance.context || new EventContext(eventName, payload, options);
    } else {
      eventName = eventOrName;
      eventInstance = null;
      context = new EventContext(eventName, payload, options);
    }

    // DevTools Hook: beforeDispatch
    for (const hook of this.devtoolsHooks.beforeDispatch) {
      hook(eventName, context);
    }

    // Execute Bus Middleware
    for (const mw of this.busMiddleware) {
      let nextCalled = false;
      await mw(context, () => { nextCalled = true; });
      if (!nextCalled) return [];
    }

    const listeners = this.registry.getListeners(eventName);
    const responses = [];

    for (const listener of listeners) {
      if (context.isPropagationStopped()) break;

      try {
        // DevTools Hook: listenerStart
        for (const hook of this.devtoolsHooks.listenerStart) {
          hook(listener, context);
        }

        let resolvedListener = listener;
        if (typeof listener === "string" && this.container) {
          const [className, methodName] = listener.split("@");
          const instance = this.container.make(className);
          resolvedListener = instance[methodName || "handle"].bind(instance);
        }

        const res = await resolvedListener(eventInstance || payload, context);
        responses.push(res);

        if (res === false) {
          context.stop();
        }

        // DevTools Hook: listenerEnd
        for (const hook of this.devtoolsHooks.listenerEnd) {
          hook(listener, context, res);
        }
      } catch (err) {
        for (const hook of this.devtoolsHooks.exception) {
          hook(listener, context, err);
        }
        throw err;
      }
    }

    // DevTools Hook: afterDispatch
    for (const hook of this.devtoolsHooks.afterDispatch) {
      hook(eventName, context, responses);
    }

    return responses;
  }

  async until(eventOrName, payload = {}, options = {}) {
    const responses = await this.dispatch(eventOrName, payload, options);
    for (const res of responses) {
      if (res !== null && res !== undefined) return res;
    }
    return null;
  }
}

export default EventDispatcher;
