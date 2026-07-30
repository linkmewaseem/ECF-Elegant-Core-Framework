export default class HookDispatcher {
    #hooks = new Map();
    #telemetry = [];

    registerHook(pluginName, eventName, callback, priorityGroup = "NORMAL", priority = 10) {
        if (!this.#hooks.has(eventName)) {
            this.#hooks.set(eventName, []);
        }

        this.#hooks.get(eventName).push({
            pluginName,
            callback,
            priorityGroup: priorityGroup.toUpperCase(),
            priority
        });

        this.sortHooks(eventName);
    }

    unregisterPluginHooks(pluginName) {
        for (const [eventName, list] of this.#hooks.entries()) {
            const filtered = list.filter(item => item.pluginName !== pluginName);
            this.#hooks.set(eventName, filtered);
        }
    }

    sortHooks(eventName) {
        const list = this.#hooks.get(eventName) || [];
        const groupOrder = { EARLY: 1, NORMAL: 2, LATE: 3 };

        list.sort((a, b) => {
            const groupDiff = groupOrder[a.priorityGroup] - groupOrder[b.priorityGroup];
            if (groupDiff !== 0) return groupDiff;
            return a.priority - b.priority;
        });
    }

    async dispatch(eventName, context) {
        const list = this.#hooks.get(eventName) || [];

        for (const item of list) {
            const startTime = performance.now();
            let status = "success";
            try {
                const result = await item.callback(context);
                if (result === false) {
                    status = "cancelled";
                    this.recordTelemetry(item.pluginName, eventName, startTime, status);
                    return false;
                }
            } catch (err) {
                status = "error";
                this.recordTelemetry(item.pluginName, eventName, startTime, status);
                throw err;
            }
            this.recordTelemetry(item.pluginName, eventName, startTime, status);
        }

        return true;
    }

    recordTelemetry(pluginName, hook, startTime, status) {
        const durationMs = Number((performance.now() - startTime).toFixed(3));
        this.#telemetry.push({
            plugin: pluginName,
            hook,
            durationMs,
            status,
            timestamp: new Date().toISOString()
        });

        if (this.#telemetry.length > 1000) {
            this.#telemetry.shift();
        }
    }

    getTelemetry() {
        return [...this.#telemetry];
    }

    clear() {
        this.#hooks.clear();
        this.#telemetry = [];
    }
}
