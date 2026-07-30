export default class EventContext {
    constructor({ event, model, changes = {}, original = {}, connection = null, inTransaction = false }) {
        this.event = event;
        this.changes = changes;
        this.original = original;
        this.connection = connection;
        this.inTransaction = Boolean(inTransaction);
        this.timestamp = new Date().toISOString();

        // Wrap model in proxy for seamless property access in event handlers
        this.model = model ? new Proxy(model, {
            get(target, prop, receiver) {
                if (typeof prop === "symbol" || prop.startsWith("#")) {
                    return Reflect.get(target, prop, receiver);
                }
                if (prop in target) {
                    const val = Reflect.get(target, prop, receiver);
                    if (typeof val === "function") {
                        return val.bind(target);
                    }
                    return val;
                }
                if (typeof target.getAttribute === "function") {
                    return target.getAttribute(prop);
                }
                return undefined;
            },
            set(target, prop, value) {
                if (typeof target.setAttribute === "function") {
                    target.setAttribute(prop, value);
                    return true;
                }
                target[prop] = value;
                return true;
            }
        }) : null;
    }
}
