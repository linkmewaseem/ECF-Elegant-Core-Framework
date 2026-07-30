import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import ConnectionManager from "../src/ConnectionManager.js";
import DatabaseManager from "../src/DatabaseManager.js";
import SchemaBuilder from "../src/schema/SchemaBuilder.js";
import Schema from "../src/facades/Schema.js";
import DB from "../src/facades/DB.js";
import { Container, Facade } from "@ecf/core";
import DatabaseServiceProvider from "../src/providers/DatabaseServiceProvider.js";

describe("SchemaBuilder Integration & Facade Tests", () => {
    let connectionManager;
    let dbManager;

    beforeEach(async () => {
        connectionManager = new ConnectionManager({
            default: "sqlite",
            connections: {
                sqlite: { driver: "sqlite", database: ":memory:" }
            }
        });
        dbManager = new DatabaseManager(connectionManager);

        const container = new Container();
        Facade.setApplication(container);
        container.singleton("db.manager", () => connectionManager);
        container.singleton("db", () => dbManager);
        container.bind("db.schema", () => dbManager.schema());
    });

    afterEach(async () => {
        if (dbManager) {
            await dbManager.disconnectAll();
        }
    });

    test("Schema.create() creates table end-to-end and hasTable() / hasColumn() verify structure", async () => {
        await Schema.create("users", (table) => {
            table.id();
            table.string("name");
            table.string("email");
            table.timestamps();
        });

        const hasUsers = await Schema.hasTable("users");
        assert.equal(hasUsers, true);

        const hasName = await Schema.hasColumn("users", "name");
        assert.equal(hasName, true);

        const hasNonExistent = await Schema.hasColumn("users", "non_existent");
        assert.equal(hasNonExistent, false);
    });

    test("Schema.table() alters existing table and Schema.drop() drops table", async () => {
        await Schema.create("products", (t) => {
            t.id();
            t.string("title");
        });

        await Schema.table("products", (t) => {
            t.string("sku");
        });

        assert.equal(await Schema.hasColumn("products", "sku"), true);

        await Schema.drop("products");
        assert.equal(await Schema.hasTable("products"), false);
    });
});
