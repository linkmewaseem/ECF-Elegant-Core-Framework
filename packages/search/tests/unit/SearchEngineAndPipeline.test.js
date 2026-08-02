import test from "node:test";
import assert from "node:assert/strict";
import { SearchEngine, MemoryDriver, NormalizeStage, TokenizerStage, SynonymStage } from "../../src/index.js";

test("SearchPipeline: executes normalization, tokenization, and synonym expansion", async () => {
  const memoryDriver = new MemoryDriver();
  const engine = new SearchEngine(() => memoryDriver);

  engine.getPipeline().use(new NormalizeStage()).use(new TokenizerStage()).use(new SynonymStage());

  await engine.getIndexer().index("goods", [
    { id: 1, name: "Television Set" },
    { id: 2, name: "Radio" },
  ]);

  const params = {
    term: "  TV  ",
    synonymsMap: { tv: ["television"] },
  };

  const res = await engine.getPipeline().process(params, async (p) => {
    return { tokens: p.tokens, expanded: p.expandedTokens };
  });

  assert.equal(res.tokens[0], "tv");
  assert.equal(res.expanded.includes("television"), true);
});
