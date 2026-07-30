export default class MetricsCollector {
    #metrics = new Map();

    recordCall(pluginName, durationMs, success = true) {
        if (!this.#metrics.has(pluginName)) {
            this.#metrics.set(pluginName, {
                calls: 0,
                totalDurationMs: 0,
                avgDurationMs: 0,
                errors: 0,
                lastCallTime: null
            });
        }

        const data = this.#metrics.get(pluginName);
        data.calls += 1;
        data.totalDurationMs += durationMs;
        data.avgDurationMs = Number((data.totalDurationMs / data.calls).toFixed(2));
        if (!success) {
            data.errors += 1;
        }
        data.lastCallTime = new Date().toISOString();
    }

    getMetrics(pluginName) {
        return this.#metrics.get(pluginName) || {
            calls: 0,
            totalDurationMs: 0,
            avgDurationMs: 0,
            errors: 0,
            lastCallTime: null
        };
    }

    getAllMetrics() {
        const result = {};
        for (const [name, metrics] of this.#metrics.entries()) {
            result[name] = { ...metrics };
        }
        return result;
    }

    clear() {
        this.#metrics.clear();
    }
}
