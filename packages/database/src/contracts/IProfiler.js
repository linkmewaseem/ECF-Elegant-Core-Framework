/**
 * Interface IProfiler
 * Query lifecycle telemetry and trace event publisher.
 */
export default class IProfiler {
    enable() { throw new Error("Method enable() must be implemented."); }
    disable() { throw new Error("Method disable() must be implemented."); }
    isEnabled() { throw new Error("Method isEnabled() must be implemented."); }
    startQuery(sql, bindings, metadata = {}) { throw new Error("Method startQuery() must be implemented."); }
    stopQuery(traceId, result = null, error = null) { throw new Error("Method stopQuery() must be implemented."); }
    getEvents() { throw new Error("Method getEvents() must be implemented."); }
    clearEvents() { throw new Error("Method clearEvents() must be implemented."); }
}
