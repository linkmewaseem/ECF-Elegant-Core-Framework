import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Connection from "../src/Connection.js";
import SQLiteDriver from "../src/drivers/SQLiteDriver.js";
import QueryBuilder from "../src/query/QueryBuilder.js";
import Expression from "../src/query/Expression.js";

describe("QueryBuilder AST, Immutability & Execution", () => {
    test("QueryBuilder is immutable and creates clones on state modification", () => {
        const conn = new Connection("sqlite", new SQLiteDriver({ database: ":memory:" }));
        const base = conn.table("users");

        const query1 = base.where("role", "admin");
        const query2 = base.where("role", "editor");

        assert.notEqual(base, query1);
        assert.notEqual(query1, query2);

        assert.equal(base.toSql().sql, 'SELECT * FROM "users"');
        assert.equal(query1.toSql().sql, 'SELECT * FROM "users" WHERE "role" = ?');
        assert.equal(query2.toSql().sql, 'SELECT * FROM "users" WHERE "role" = ?');

        assert.deepEqual(query1.toSql().bindings, ["admin"]);
        assert.deepEqual(query2.toSql().bindings, ["editor"]);
    });

    test("QueryBuilder supports custom macros for scope extensions", async () => {
        QueryBuilder.macro("activeAdmins", function() {
            return this.where("status", "active").where("role", "admin");
        });

        const conn = new Connection("sqlite", new SQLiteDriver({ database: ":memory:" }));
        const query = conn.table("users").activeAdmins();

        const { sql, bindings } = query.toSql();
        assert.equal(sql, 'SELECT * FROM "users" WHERE "status" = ? AND "role" = ?');
        assert.deepEqual(bindings, ["active", "admin"]);
    });

    test("executes CRUD & Aggregate operations end-to-end on SQLite database", async () => {
        const driver = new SQLiteDriver({ database: ":memory:" });
        const conn = new Connection("sqlite", driver);
        await conn.connect();

        // Create table
        await conn.query("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, score INT, active INT)");

        const users = conn.table("users");

        // Insert
        const id1 = await users.insertGetId({ name: "Waseem", email: "waseem@ecf.dev", score: 100, active: 1 });
        const id2 = await users.insertGetId({ name: "John", email: "john@ecf.dev", score: 80, active: 0 });

        assert.equal(id1, 1);
        assert.equal(id2, 2);

        // Get & First
        const allUsers = await users.orderBy("id", "ASC").get();
        assert.equal(allUsers.length, 2);
        assert.equal(allUsers[0].name, "Waseem");

        const firstUser = await users.where("email", "john@ecf.dev").first();
        assert.equal(firstUser.name, "John");

        // Pluck & Exists & Count
        const names = await users.pluck("name");
        assert.deepEqual(names, ["Waseem", "John"]);

        const exists = await users.where("score", ">=", 90).exists();
        assert.equal(exists, true);

        const count = await users.where("active", 1).count();
        assert.equal(count, 1);

        const maxScore = await users.max("score");
        assert.equal(maxScore, 100);

        // Update
        const updatedRows = await users.where("id", 2).update({ score: 95, active: 1 });
        assert.equal(updatedRows, 1);

        const activeCountAfterUpdate = await users.where("active", 1).count();
        assert.equal(activeCountAfterUpdate, 2);

        // Delete
        const deletedRows = await users.where("id", 1).delete();
        assert.equal(deletedRows, 1);

        const remainingCount = await users.count();
        assert.equal(remainingCount, 1);

        await conn.disconnect();
    });
});
