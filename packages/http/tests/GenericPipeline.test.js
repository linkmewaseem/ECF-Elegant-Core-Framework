import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Pipeline from "../src/Pipeline.js";

describe("Generic Pipeline Engine", () => {
    test("runs pipeline with arbitrary non-HTTP objects (e.g. Queue Job or CLI Command)", async () => {
        const job = { type: "SendEmail", attempts: 0 };
        const log = [];

        const retryMiddleware = async (j, next) => {
            log.push("retry-start");
            j.attempts++;
            const res = await next(j);
            log.push("retry-end");
            return res;
        };

        const loggerMiddleware = async (j, next) => {
            log.push("logger-start");
            const res = await next(j);
            log.push("logger-end");
            return res;
        };

        const result = await new Pipeline()
            .send(job)
            .through([retryMiddleware, loggerMiddleware])
            .then(async (j) => {
                log.push(`process-${j.type}`);
                return "job-completed";
            });

        assert.equal(result, "job-completed");
        assert.equal(job.attempts, 1);
        assert.deepEqual(log, ["retry-start", "logger-start", "process-SendEmail", "logger-end", "retry-end"]);
    });

    test("supports class-based pipes with handle() method", async () => {
        class ClassPipe {
            async handle(ctx, next) {
                ctx.value += 10;
                return await next(ctx);
            }
        }

        const ctx = { value: 5 };
        const result = await new Pipeline()
            .send(ctx)
            .through([new ClassPipe()])
            .then(async (c) => c.value * 2);

        assert.equal(result, 30);
    });

    test("allows short-circuiting in pipeline execution", async () => {
        let destinationCalled = false;

        const blocker = async (ctx, next) => {
            return "blocked-result";
        };

        const result = await new Pipeline()
            .send({ id: 1 })
            .through([blocker])
            .then(async (ctx) => { destinationCalled = true; return "ok"; });

        assert.equal(result, "blocked-result");
        assert.equal(destinationCalled, false);
    });
});
