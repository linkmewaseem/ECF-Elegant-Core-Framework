import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Connection from "../src/Connection.js";
import SQLiteDriver from "../src/drivers/SQLiteDriver.js";

describe("Connection & Transaction Management", () => {
    test("tracks connection state, inTransaction(), transactionLevel(), and events", async () => {
        const events = [];
        const eventDispatcher = (eventName, payload) => events.push({ eventName, payload });

        const driver = new SQLiteDriver({ database: ":memory:" });
        const conn = new Connection("sqlite", driver, eventDispatcher);

        assert.equal(conn.isConnected(), false);
        assert.equal(conn.inTransaction(), false);
        assert.equal(conn.transactionLevel(), 0);

        await conn.connect();
        assert.equal(conn.isConnected(), true);
        assert.equal(events.some(e => e.eventName === "ConnectionOpened"), true);

        // Execute query
        await conn.query("CREATE TABLE test_state (id INTEGER PRIMARY KEY, title TEXT)");
        assert.equal(events.some(e => e.eventName === "QueryExecuted"), true);

        // Begin transaction
        await conn.beginTransaction();
        assert.equal(conn.inTransaction(), true);
        assert.equal(conn.transactionLevel(), 1);
        assert.equal(events.some(e => e.eventName === "TransactionStarted"), true);

        // Nested savepoint transaction
        await conn.beginTransaction();
        assert.equal(conn.transactionLevel(), 2);

        // Commit nested
        await conn.commit();
        assert.equal(conn.transactionLevel(), 1);

        // Commit outer
        await conn.commit();
        assert.equal(conn.inTransaction(), false);
        assert.equal(conn.transactionLevel(), 0);

        await conn.disconnect();
        assert.equal(conn.isConnected(), false);
        assert.equal(events.some(e => e.eventName === "ConnectionClosed"), true);
    });

    test("transaction closure auto-commits on success and rolls back on exception", async () => {
        const driver = new SQLiteDriver({ database: ":memory:" });
        const conn = new Connection("sqlite", driver);
        await conn.connect();

        await conn.query("CREATE TABLE accounts (id INTEGER PRIMARY KEY, balance INT)");
        await conn.query("INSERT INTO accounts (id, balance) VALUES (1, 100)");

        // Successful transaction closure
        await conn.transaction(async (tx) => {
            await tx.query("UPDATE accounts SET balance = 200 WHERE id = 1");
        });

        const rows1 = await conn.select("SELECT balance FROM accounts WHERE id = 1");
        assert.equal(rows1[0].balance, 200);

        // Failing transaction closure -> rolls back
        await assert.rejects(async () => {
            await conn.transaction(async (tx) => {
                await tx.query("UPDATE accounts SET balance = 999 WHERE id = 1");
                throw new Error("Simulated failure inside transaction");
            });
        });

        const rows2 = await conn.select("SELECT balance FROM accounts WHERE id = 1");
        assert.equal(rows2[0].balance, 200); // Rolled back to 200

        await conn.disconnect();
    });
});
