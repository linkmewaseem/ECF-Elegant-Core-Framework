import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Connection from "../../src/Connection.js";
import SQLiteDriver from "../../src/drivers/SQLiteDriver.js";

describe("CursorPagination & Data Streaming Suite", () => {
    test("paginate and cursorPaginate iteration", async () => {
        const driver = new SQLiteDriver({ database: ":memory:" });
        const conn = new Connection("sqlite", driver);
        await conn.connect();

        await conn.query("CREATE TABLE items (id INTEGER PRIMARY KEY, title TEXT)");
        const itemsQuery = conn.table("items");

        for (let i = 1; i <= 25; i++) {
            await itemsQuery.insert({ id: i, title: `Item ${i}` });
        }

        // Offset Pagination
        const page1 = await itemsQuery.paginate(10, 1);
        assert.equal(page1.data.length, 10);
        assert.equal(page1.total, 25);
        assert.equal(page1.lastPage, 3);
        assert.equal(page1.hasMore, true);

        // Cursor Pagination
        const cursor1 = await itemsQuery.cursorPaginate(10, null, "id");
        assert.equal(cursor1.data.length, 10);
        assert.equal(cursor1.nextCursor, 10);
        assert.equal(cursor1.hasMore, true);

        const cursor2 = await itemsQuery.cursorPaginate(10, cursor1.nextCursor, "id");
        assert.equal(cursor2.data.length, 10);
        assert.equal(cursor2.nextCursor, 20);

        const cursor3 = await itemsQuery.cursorPaginate(10, cursor2.nextCursor, "id");
        assert.equal(cursor3.data.length, 5);
        assert.equal(cursor3.nextCursor, null);
        assert.equal(cursor3.hasMore, false);

        // Generators: cursor() and lazy()
        let count = 0;
        for await (const row of itemsQuery.paginator.cursor("id")) {
            count++;
            assert.ok(row.title.startsWith("Item "));
        }
        assert.equal(count, 25);

        await conn.disconnect();
    });
});
