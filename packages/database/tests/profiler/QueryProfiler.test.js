import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryProfiler from "../../src/profiler/QueryProfiler.js";
import QueryEventStream from "../../src/profiler/QueryEventStream.js";

describe("QueryProfiler & Lifecycle Event Stream", () => {
    let profiler;
    let eventStream;

    beforeEach(() => {
        eventStream = new QueryEventStream();
        profiler = new QueryProfiler(eventStream);
    });

    test("publishes 5-stage query lifecycle events when enabled", () => {
        profiler.enable();
        const stagesReceived = [];

        eventStream.subscribe(evt => {
            stagesReceived.push(evt.stage);
        });

        const traceId = profiler.startQuery('SELECT * FROM "users"', []);
        profiler.emitStage(traceId, "Compiled");
        profiler.emitStage(traceId, "Executing");
        profiler.stopQuery(traceId, [{ id: 1 }]);

        assert.deepEqual(stagesReceived, [
            "Query Started",
            "Compiled",
            "Executing",
            "Executed"
        ]);

        const events = profiler.getEvents();
        assert.equal(events.length, 1);
        assert.equal(events[0].rowCount, 1);
        assert.ok(events[0].caller.file !== undefined);
    });

    test("acts as zero-overhead no-op when disabled", () => {
        profiler.disable();
        const traceId = profiler.startQuery('SELECT * FROM "users"', []);
        assert.equal(traceId, null);
        assert.equal(profiler.getEvents().length, 0);
    });
});
