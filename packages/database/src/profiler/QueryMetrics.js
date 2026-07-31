import IMetrics from "../contracts/IMetrics.js";

export default class QueryMetrics extends IMetrics {
    #metrics = {
        Queries: { total: 0, duplicate: 0, slow: 0 },
        Cache: { hits: 0, misses: 0, latencyMs: 0 },
        Hydration: { count: 0, durationMs: 0 },
        Relations: { eagerHits: 0, eagerMisses: 0 },
        Extensions: { pluginExecutions: 0, pluginOverheadMs: 0 },
        Drivers: { poolActive: 0, statementExecutions: 0 }
    };

    increment(category, metric, value = 1) {
        if (this.#metrics[category] && this.#metrics[category][metric] !== undefined) {
            this.#metrics[category][metric] += value;
        } else {
            if (!this.#metrics[category]) this.#metrics[category] = {};
            this.#metrics[category][metric] = (this.#metrics[category][metric] || 0) + value;
        }
    }

    record(category, metric, value) {
        if (!this.#metrics[category]) this.#metrics[category] = {};
        this.#metrics[category][metric] = value;
    }

    getMetrics(category = null) {
        if (category) {
            return { ...(this.#metrics[category] || {}) };
        }
        const result = {};
        for (const [cat, data] of Object.entries(this.#metrics)) {
            result[cat] = { ...data };
        }
        return result;
    }

    resetMetrics(category = null) {
        if (category) {
            if (category === "Queries") this.#metrics.Queries = { total: 0, duplicate: 0, slow: 0 };
            else if (category === "Cache") this.#metrics.Cache = { hits: 0, misses: 0, latencyMs: 0 };
            else if (category === "Hydration") this.#metrics.Hydration = { count: 0, durationMs: 0 };
            else if (category === "Relations") this.#metrics.Relations = { eagerHits: 0, eagerMisses: 0 };
            else if (category === "Extensions") this.#metrics.Extensions = { pluginExecutions: 0, pluginOverheadMs: 0 };
            else if (category === "Drivers") this.#metrics.Drivers = { poolActive: 0, statementExecutions: 0 };
            else this.#metrics[category] = {};
        } else {
            this.#metrics = {
                Queries: { total: 0, duplicate: 0, slow: 0 },
                Cache: { hits: 0, misses: 0, latencyMs: 0 },
                Hydration: { count: 0, durationMs: 0 },
                Relations: { eagerHits: 0, eagerMisses: 0 },
                Extensions: { pluginExecutions: 0, pluginOverheadMs: 0 },
                Drivers: { poolActive: 0, statementExecutions: 0 }
            };
        }
    }
}
