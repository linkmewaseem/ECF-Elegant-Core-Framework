import { describe, test } from "node:test";
import assert from "node:assert/strict";
import ConnectionManager from "../src/ConnectionManager.js";
import Driver from "../src/Driver.js";

class CustomDriver extends Driver {
    async query(sql, bindings = []) {
        return this.normalizeResult({ rows: [{ custom: true }] });
    }
}

describe("ConnectionManager & Dynamic Driver Registry", () => {
    test("resolves default connection and caches connection instances", () => {
        const manager = new ConnectionManager({
            default: "sqlite",
            connections: {
                sqlite: { driver: "sqlite", database: ":memory:" }
            }
        });

        const conn1 = manager.connection();
        const conn2 = manager.connection("sqlite");

        assert.equal(conn1.name, "sqlite");
        assert.equal(conn1, conn2); // Cached singleton connection instance
    });

    test("supports dynamic driver registration via registerDriver()", async () => {
        const manager = new ConnectionManager();

        // Register custom third-party driver plugin
        manager.registerDriver("custom_db", CustomDriver);

        const conn = manager.connection("custom_db");
        await conn.connect();

        const res = await conn.query("SELECT 1");
        assert.equal(res.rows[0].custom, true);

        await manager.disconnectAll();
    });

    test("throws ConnectionException for unregistered driver", () => {
        const manager = new ConnectionManager();
        assert.throws(() => {
            manager.connection("unknown_driver");
        }, /Database driver "unknown_driver" is not registered/);
    });
});
