import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryMetrics from "../../src/profiler/QueryMetrics.js";

describe("QueryMetrics Engine", () => {
    let metrics;

    beforeEach(() => {
        metrics = new QueryMetrics();
    });

    test("tracks 6 isolated channels accurately", () => {
        metrics.increment("Queries", "total", 5);
        metrics.increment("Cache", "hits", 12);
        metrics.increment("Hydration", "count", 100);
        metrics.increment("Relations", "eagerHits", 8);
        metrics.increment("Extensions", "pluginExecutions", 3);
        metrics.increment("Drivers", "statementExecutions", 5);

        const allMetrics = metrics.getMetrics();

        assert.equal(allMetrics.Queries.total, 5);
        assert.equal(allMetrics.Cache.hits, 12);
        assert.equal(allMetrics.Hydration.count, 100);
        assert.equal(allMetrics.Relations.eagerHits, 8);
        assert.equal(allMetrics.Extensions.pluginExecutions, 3);
        assert.equal(allMetrics.Drivers.statementExecutions, 5);
    });

    test("resets metrics by category or globally", () => {
        metrics.increment("Queries", "total", 10);
        metrics.increment("Cache", "hits", 5);

        metrics.resetMetrics("Queries");
        assert.equal(metrics.getMetrics("Queries").total, 0);
        assert.equal(metrics.getMetrics("Cache").hits, 5);

        metrics.resetMetrics();
        assert.equal(metrics.getMetrics("Cache").hits, 0);
    });
});
