import test from "node:test";
import assert from "node:assert/strict";
import MarkdownCompiler from "../../src/markdown/MarkdownCompiler.js";

test("MarkdownCompiler - compiles Markdown to inline styled HTML", async () => {
  const compiler = new MarkdownCompiler();
  const md = "# Welcome\n\nThis is a [link](https://example.com) to test.";

  const compiled = await compiler.compile(md);

  assert.ok(compiled.includes('<h1 style="color: #111827;">Welcome</h1>'));
  assert.ok(compiled.includes('href="https://example.com"'));
});
