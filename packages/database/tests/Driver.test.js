import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Driver from "../src/Driver.js";
import SQLiteDriver from "../src/drivers/SQLiteDriver.js";
import MySQLDriver from "../src/drivers/MySQLDriver.js";
import PostgreSQLDriver from "../src/drivers/PostgreSQLDriver.js";

describe("Database Drivers & Capabilities", () => {
    test("Driver abstract class provides default capabilities and quotation helpers", () => {
        const driver = new Driver();

        assert.equal(driver.connected, false);
        assert.equal(driver.supports.transactions, true);
        assert.equal(driver.escapeIdentifier("users"), '"users"');
        assert.equal(driver.quote(null), "NULL");
        assert.equal(driver.quote(42), "42");
        assert.equal(driver.quote(true), "1");
        assert.equal(driver.quote("O'Reilly"), "'O''Reilly'");
    });

    test("SQLiteDriver escapes identifiers with quotes and normalizes query output", async () => {
        const driver = new SQLiteDriver({ database: ":memory:" });
        await driver.connect();

        assert.equal(driver.connected, true);
        assert.equal(driver.supports.savepoints, true);
        assert.equal(driver.escapeIdentifier("table_name"), '"table_name"');

        // Create table and insert data
        await driver.query("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)");
        const insertRes = await driver.query("INSERT INTO users (name) VALUES (?)", ["Alice"]);

        assert.equal(typeof insertRes.insertId, "number");
        assert.equal(insertRes.affectedRows, 1);

        const selectRes = await driver.query("SELECT * FROM users");
        assert.equal(selectRes.rowCount, 1);
        assert.equal(selectRes.rows[0].name, "Alice");

        await driver.disconnect();
        assert.equal(driver.connected, false);
    });

    test("MySQLDriver & PostgreSQLDriver escape identifiers correctly", () => {
        const mysql = new MySQLDriver();
        const pg = new PostgreSQLDriver();

        assert.equal(mysql.escapeIdentifier("users"), "`users`");
        assert.equal(pg.escapeIdentifier("users"), '"users"');

        assert.equal(mysql.supports.returning, false);
        assert.equal(pg.supports.returning, true);
    });
});
