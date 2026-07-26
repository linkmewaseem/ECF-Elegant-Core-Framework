import { describe, test } from "node:test";
import assert from "node:assert/strict";
import deepFreeze from "../../src/utils/deepFreeze.js";

describe("deepFreeze", () => {
    test("should freeze nested objects, not just the top level", () => {
        const obj = deepFreeze({ a: { b: { c: 1 } } });
        assert.throws(() => { obj.a.b.c = 2; }, TypeError);
    });

    test("should freeze arrays and their contents", () => {
        const obj = deepFreeze({ children: [{ value: "x" }] });
        assert.throws(() => { obj.children[0].value = "y"; }, TypeError);
        assert.throws(() => { obj.children.push({}); }, TypeError);
    });
});
