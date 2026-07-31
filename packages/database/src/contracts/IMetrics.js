/**
 * Interface IMetrics
 * Categorized counters and health diagnostics provider.
 */
export default class IMetrics {
    increment(category, metric, value = 1) { throw new Error("Method increment() must be implemented."); }
    record(category, metric, value) { throw new Error("Method record() must be implemented."); }
    getMetrics(category = null) { throw new Error("Method getMetrics() must be implemented."); }
    resetMetrics(category = null) { throw new Error("Method resetMetrics() must be implemented."); }
}
