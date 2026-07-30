export default class MetricsCollector {
    #listeners = new Map();
    queriesCount = 0;
    hydratedModelsCount = 0;
    identityReusedCount = 0;
    startTime = 0;
    durationMs = 0;

    start() {
        this.startTime = performance.now();
        this.queriesCount = 0;
        this.hydratedModelsCount = 0;
        this.identityReusedCount = 0;
    }

    finish() {
        this.durationMs = performance.now() - this.startTime;
        this.emit("finish", this.getMetrics());
    }

    recordQuery() {
        this.queriesCount++;
        this.emit("query", { count: this.queriesCount });
    }

    recordHydration(count) {
        this.hydratedModelsCount += count;
        this.emit("hydrate", { total: this.hydratedModelsCount });
    }

    recordIdentityReuse(count = 1) {
        this.identityReusedCount += count;
    }

    on(event, callback) {
        if (!this.#listeners.has(event)) {
            this.#listeners.set(event, []);
        }
        this.#listeners.get(event).push(callback);
        return this;
    }

    emit(event, payload) {
        const callbacks = this.#listeners.get(event);
        if (callbacks) {
            for (const cb of callbacks) {
                cb(payload);
            }
        }
    }

    getMetrics() {
        return {
            queries: this.queriesCount,
            hydratedModels: this.hydratedModelsCount,
            identityReused: this.identityReusedCount,
            durationMs: Number(this.durationMs.toFixed(2))
        };
    }
}
