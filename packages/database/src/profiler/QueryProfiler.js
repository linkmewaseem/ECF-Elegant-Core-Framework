import IProfiler from "../contracts/IProfiler.js";
import QueryEventStream from "./QueryEventStream.js";

export default class QueryProfiler extends IProfiler {
    #enabled = false;
    #events = [];
    #activeTraces = new Map();
    #eventStream;

    constructor(eventStream = new QueryEventStream()) {
        super();
        this.#eventStream = eventStream;
    }

    get eventStream() { return this.#eventStream; }

    enable() {
        this.#enabled = true;
        this.#eventStream.enable();
    }

    disable() {
        this.#enabled = false;
        this.#eventStream.disable();
    }

    isEnabled() {
        return this.#enabled;
    }

    captureCaller() {
        if (!this.#enabled) return null;
        const err = new Error();
        const stack = err.stack ? err.stack.split("\n") : [];
        const callerLine = stack[3] || stack[2] || "";
        const match = callerLine.match(/at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?/);
        if (match) {
            return {
                method: match[1] || "anonymous",
                file: match[2],
                line: Number(match[3])
            };
        }
        return { method: "unknown", file: "unknown", line: 0 };
    }

    startQuery(sql, bindings = [], metadata = {}) {
        if (!this.#enabled) return null;

        const traceId = `trace_${Math.random().toString(36).substring(2, 9)}`;
        const startMem = process.memoryUsage().heapUsed;
        const startTime = performance.now();
        const caller = this.captureCaller();

        const trace = {
            traceId,
            sql,
            bindings,
            metadata,
            caller,
            startTime,
            startMem,
            stage: "Query Started"
        };

        this.#activeTraces.set(traceId, trace);
        this.#eventStream.emit("Query Started", trace);
        return traceId;
    }

    emitStage(traceId, stage, extra = {}) {
        if (!this.#enabled || !this.#activeTraces.has(traceId)) return;
        const trace = this.#activeTraces.get(traceId);
        trace.stage = stage;
        this.#eventStream.emit(stage, { ...trace, ...extra });
    }

    stopQuery(traceId, result = null, error = null) {
        if (!this.#enabled || !this.#activeTraces.has(traceId)) return null;

        const trace = this.#activeTraces.get(traceId);
        const durationMs = Number((performance.now() - trace.startTime).toFixed(2));
        const memoryDelta = process.memoryUsage().heapUsed - trace.startMem;
        const rowCount = Array.isArray(result) ? result.length : (result && result.rows ? result.rows.length : 0);

        const event = {
            ...trace,
            stage: "Executed",
            durationMs,
            memoryDelta,
            rowCount,
            error
        };

        this.#events.push(event);
        this.#activeTraces.delete(traceId);
        this.#eventStream.emit("Executed", event);
        return event;
    }

    getEvents() {
        return [...this.#events];
    }

    clearEvents() {
        this.#events = [];
        this.#activeTraces.clear();
    }
}
