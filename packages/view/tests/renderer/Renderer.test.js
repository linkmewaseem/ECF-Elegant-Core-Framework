import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Renderer from "../../src/renderer/Renderer.js";
import ViewError from "../../src/errors/ViewError.js";

describe("Renderer", () => {
    const makeTemplate = (html = "<p>OK</p>") => ({
        render: (data = {}) => html
    });

    test("render() should return the output of compiledTemplate.render()", () => {
        const renderer = new Renderer();
        const result = renderer.render(makeTemplate("<p>OK</p>"), {});
        assert.equal(result, "<p>OK</p>");
    });

    test("render() should throw ViewError if compiledTemplate is invalid", () => {
        assert.throws(() => new Renderer().render(null), ViewError);
        assert.throws(() => new Renderer().render({ render: "not-a-function" }), ViewError);
    });

    test("renderToStream() should return a Readable stream of HTML content", async () => {
        const renderer = new Renderer();
        const stream = renderer.renderToStream(makeTemplate("<h1>Stream HTML</h1>"), {});
        let content = "";
        for await (const chunk of stream) {
            content += chunk;
        }
        assert.equal(content, "<h1>Stream HTML</h1>");
    });

    test("renderStatic() should return static HTML content string", () => {
        const renderer = new Renderer();
        const result = renderer.renderStatic(makeTemplate("<div>Static</div>"), {});
        assert.equal(result, "<div>Static</div>");
    });
});
