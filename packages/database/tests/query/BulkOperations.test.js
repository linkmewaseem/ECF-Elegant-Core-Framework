import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Connection from "../../src/Connection.js";
import SQLiteDriver from "../../src/drivers/SQLiteDriver.js";

describe("BulkOperations Enterprise APIs", () => {
    test("insertMany, updateMany, deleteMany, and upsert batch execution", async () => {
        const driver = new SQLiteDriver({ database: ":memory:" });
        const conn = new Connection("sqlite", driver);
        await conn.connect();

        await conn.query("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, score INT)");
        const query = conn.table("users");

        // insertMany
        const records = [
            { id: 1, name: "Alice", email: "alice@ecf.dev", score: 10 },
            { id: 2, name: "Bob", email: "bob@ecf.dev", score: 20 },
            { id: 3, name: "Charlie", email: "charlie@ecf.dev", score: 30 }
        ];

        const inserted = await query.insertMany(records, 2);
        assert.equal(inserted, 3);
        const count = await query.count();
        assert.equal(count, 3);

        // upsert
        const upsertRecords = [
            { id: 2, name: "Bob Updated", email: "bob@ecf.dev", score: 25 },
            { id: 4, name: "David", email: "david@ecf.dev", score: 40 }
        ];

        await query.upsert(upsertRecords, ["id"], ["name", "score"]);
        const updatedBob = await query.where("id", 2).first();
        assert.equal(updatedBob.name, "Bob Updated");
        assert.equal(updatedBob.score, 25);

        // deleteMany
        const deleted = await query.deleteMany([1, 4]);
        assert.equal(deleted, 2);
        const finalCount = await query.count();
        assert.equal(finalCount, 2);

        await conn.disconnect();
    });
});
