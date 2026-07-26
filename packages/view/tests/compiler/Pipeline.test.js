import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Pipeline from "../../src/compiler/Pipeline.js";

describe("Pipeline", () => {
    test("run() should chain stage outputs in order", () => {
        const pipeline = new Pipeline()
            .use("double", { double: (n) => n * 2 }, "double")
            .use("increment", { increment: (n) => n + 1 }, "increment");

        assert.equal(pipeline.run(5), 11); // (5*2)+1
    });

    test("runWithTrace() should expose each stage's output", () => {
        const pipeline = new Pipeline()
            .use("double", { double: (n) => n * 2 }, "double");

        const { result, trace } = pipeline.runWithTrace(5);
        assert.equal(result, 10);
        assert.deepEqual(trace, [{ name: "double", output: 10 }]);
    });
});
