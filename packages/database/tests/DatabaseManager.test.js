import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Application, Facade } from "@ecf/core";
import DatabaseServiceProvider from "../src/providers/DatabaseServiceProvider.js";
import DB from "../src/facades/DB.js";

describe("DatabaseManager & Container DB Facade Integration", () => {
    test("registers 'db' binding in container and delegates through DB facade", async () => {
        const app = new Application();
        app.register(DatabaseServiceProvider);
        app.boot();

        Facade.setApplication(app);

        const db = app.make("db");
        assert.equal(typeof db.connection, "function");

        // Execute raw database queries via DB facade
        await DB.query("CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT)");
        await DB.insert("INSERT INTO users (email) VALUES (?)", ["test@ecf.dev"]);

        const users = await DB.select("SELECT * FROM users");

        assert.equal(users.length, 1);
        assert.equal(users[0].email, "test@ecf.dev");

        await DB.disconnectAll();
    });
});
