import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Connection from "../../src/Connection.js";
import SQLiteDriver from "../../src/drivers/SQLiteDriver.js";

describe("ExplainEngine & Index Advisor", () => {
    test("generates query execution plan and index suggestions", async () => {
        const driver = new SQLiteDriver({ database: ":memory:" });
        const conn = new Connection("sqlite", driver);
        await conn.connect();

        await conn.query("CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT, status TEXT)");
        const query = conn.table("users").where("status", "active").orderBy("email", "ASC");

        const explainRes = await query.explain();
        assert.ok(Array.isArray(explainRes.rows));

        const suggestionsRes = await query.explainWithSuggestions();
        assert.ok(suggestionsRes.plan !== undefined);
        assert.ok(suggestionsRes.suggestions.length >= 1);
        assert.equal(suggestionsRes.suggestions[0].type, "INDEX_RECOMMENDATION");

        await conn.disconnect();
    });
});
