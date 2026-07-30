import EventContext from "./EventContext.js";

const PRE_EVENTS = new Set([
    "saving",
    "creating",
    "updating",
    "deleting",
    "restoring",
    "forceDeleting"
]);

const LIFECYCLE_METHODS = [
    "retrieved",
    "saving",
    "saved",
    "creating",
    "created",
    "updating",
    "updated",
    "deleting",
    "deleted",
    "restoring",
    "restored",
    "forceDeleting",
    "forceDeleted"
];

export default class ModelEventBus {
    static #listeners = new Map();
    static #transactionBuffers = new Map();
    static #connectionHooksBound = new Set();

    static on(modelClass, eventPattern, callback, priority = 10) {
        if (!modelClass) return;
        const className = modelClass.name || "Model";
        const key = `${className}:${eventPattern}`;

        if (!this.#listeners.has(key)) {
            this.#listeners.set(key, []);
        }

        this.#listeners.get(key).push({ callback, priority });
        this.#listeners.get(key).sort((a, b) => a.priority - b.priority);
    }

    static observe(modelClass, observer, priority = 10) {
        if (!modelClass || !observer) return;
        const target = typeof observer === "function" ? new observer() : observer;

        for (const method of LIFECYCLE_METHODS) {
            if (typeof target[method] === "function") {
                this.on(modelClass, method, context => target[method](context), priority);
            }
        }
    }

    static bindConnection(connection) {
        if (!connection || this.#connectionHooksBound.has(connection)) {
            return;
        }
        this.#connectionHooksBound.add(connection);

        if (typeof connection.setEventDispatcher === "function") {
            connection.setEventDispatcher((eventName, payload) => {
                if (eventName === "TransactionCommitted" && payload.level === 0) {
                    this.flushTransactionBuffer(connection);
                } else if (eventName === "TransactionRolledBack" && payload.level === 0) {
                    this.purgeTransactionBuffer(connection);
                }
            });
        }
    }

    static async dispatch(eventContext) {
        if (!(eventContext instanceof EventContext)) {
            eventContext = new EventContext(eventContext);
        }

        const { event, model, connection, inTransaction } = eventContext;
        if (connection) {
            this.bindConnection(connection);
        }

        const isPreEvent = PRE_EVENTS.has(event);
        const isTxActive = inTransaction || (connection && typeof connection.inTransaction === "function" && connection.inTransaction());

        // For Post-Events in an active transaction, buffer until commit
        if (!isPreEvent && isTxActive) {
            const connKey = connection || "default";
            if (!this.#transactionBuffers.has(connKey)) {
                this.#transactionBuffers.set(connKey, []);
            }
            this.#transactionBuffers.get(connKey).push(eventContext);
            return true;
        }

        return this.executeDispatch(eventContext);
    }

    static async executeDispatch(eventContext) {
        const { event, model } = eventContext;
        const modelClass = typeof model === "function" ? model : (model?.constructor || Object.getPrototypeOf(model)?.constructor);
        const className = modelClass ? modelClass.name : "Model";

        // Collect matching listeners (exact match, wildcard *, namespace created:*)
        const matchingEntries = [];

        const addEntriesFromKey = key => {
            const list = this.#listeners.get(key) || [];
            matchingEntries.push(...list);
        };

        addEntriesFromKey(`${className}:${event}`);
        addEntriesFromKey(`${className}:*`);
        addEntriesFromKey(`*:${event}`);
        addEntriesFromKey(`*:*`);

        // Check instance inline lifecycle method hook (e.g. user.onCreating)
        const hookMethod = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;
        if (model && typeof model[hookMethod] === "function") {
            const hookRes = await model[hookMethod](eventContext);
            if (hookRes === false) {
                return false;
            }
        }

        // Sort collected listeners by priority ascending (lower number runs first)
        matchingEntries.sort((a, b) => a.priority - b.priority);

        for (const entry of matchingEntries) {
            const res = await entry.callback(eventContext);
            if (res === false) {
                return false;
            }
        }

        return true;
    }

    static async flushTransactionBuffer(connection) {
        const connKey = connection || "default";
        const buffer = this.#transactionBuffers.get(connKey) || [];
        this.#transactionBuffers.delete(connKey);

        for (const ctx of buffer) {
            ctx.inTransaction = false;
            await this.executeDispatch(ctx);
        }
    }

    static purgeTransactionBuffer(connection) {
        const connKey = connection || "default";
        this.#transactionBuffers.delete(connKey);
    }

    static clearAllListeners() {
        this.#listeners.clear();
        this.#transactionBuffers.clear();
        this.#connectionHooksBound.clear();
    }
}
