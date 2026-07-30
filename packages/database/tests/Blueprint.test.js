import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Blueprint from "../src/schema/Blueprint.js";
import ColumnDefinition from "../src/schema/ColumnDefinition.js";
import ForeignIdColumnDefinition from "../src/schema/ForeignIdColumnDefinition.js";
import NamingStrategy from "../src/schema/NamingStrategy.js";
import {
    CreateTableCommand,
    AddColumnCommand,
    DropColumnCommand,
    RenameColumnCommand,
    AddIndexCommand,
    DropIndexCommand,
    AddForeignKeyCommand
} from "../src/schema/Command.js";

describe("Blueprint AST Collection & Fluent Modifiers", () => {
    test("collects column definitions and commands fluently when creating a table", () => {
        const table = new Blueprint("users", (t) => {
            t.create();
            t.id();
            t.string("name", 150).notNull().default("ECF");
            t.string("email").unique();
            t.timestamps();
        });

        assert.equal(table.table, "users");
        assert.equal(table.creating, true);
        assert.equal(table.columns.length, 5); // id, name, email, created_at, updated_at

        assert.equal(table.commands[0] instanceof CreateTableCommand, true);
        assert.equal(table.commands[0].type, "createTable");

        const nameCol = table.columns[1];
        assert.equal(nameCol.name, "name");
        assert.equal(nameCol.type, "string");
        assert.equal(nameCol.parameters.length, 150);
        assert.equal(nameCol.get("nullable"), false);
        assert.equal(nameCol.get("default"), "ECF");

        const emailCol = table.columns[2];
        assert.equal(emailCol.get("unique"), true);

        const createdAt = table.columns[3];
        const updatedAt = table.columns[4];
        assert.equal(createdAt.name, "created_at");
        assert.equal(updatedAt.name, "updated_at");
    });

    test("generic addColumn() factory works for all column types", () => {
        const table = new Blueprint("products");
        table.addColumn("custom_geo", "location", { srid: 4326 });

        assert.equal(table.columns.length, 1);
        assert.equal(table.columns[0].type, "custom_geo");
        assert.equal(table.columns[0].name, "location");
        assert.equal(table.columns[0].parameters.srid, 4326);
    });

    test("supports foreignId().constrained() helper with convention-based naming", () => {
        const table = new Blueprint("posts");
        table.create();
        const userFk = table.foreignId("user_id").constrained().cascadeOnDelete();

        assert.equal(userFk instanceof ForeignIdColumnDefinition, true);
        assert.equal(userFk.get("unsigned"), true);
        assert.equal(table.commands.length, 2); // CreateTableCommand, AddForeignKeyCommand

        const fkCmd = table.commands[1];
        assert.equal(fkCmd instanceof AddForeignKeyCommand, true);
        assert.equal(fkCmd.type, "addForeignKey");
        assert.deepEqual(fkCmd.columns, ["user_id"]);
        assert.equal(fkCmd.onTable, "users");
        assert.deepEqual(fkCmd.referencesColumns, ["id"]);
        assert.equal(fkCmd.onDeleteAction, "CASCADE");
    });

    test("generates index and foreign key commands with auto-generated index names", () => {
        const table = new Blueprint("orders");
        table.index("status");
        table.unique(["user_id", "created_at"]);
        table.dropColumn("old_col");
        table.renameColumn("legacy_col", "new_col");

        assert.equal(table.commands.length, 4);

        const indexCmd = table.commands[0];
        assert.equal(indexCmd instanceof AddIndexCommand, true);
        assert.equal(indexCmd.indexName, "orders_status_index");

        const uniqueCmd = table.commands[1];
        assert.equal(uniqueCmd instanceof AddIndexCommand, true);
        assert.equal(uniqueCmd.indexName, "orders_user_id_created_at_unique");

        const dropCmd = table.commands[2];
        assert.equal(dropCmd instanceof DropColumnCommand, true);
        assert.deepEqual(dropCmd.columns, ["old_col"]);

        const renameCmd = table.commands[3];
        assert.equal(renameCmd instanceof RenameColumnCommand, true);
        assert.equal(renameCmd.from, "legacy_col");
        assert.equal(renameCmd.to, "new_col");
    });

    test("Command supports explicit type property and Visitor Pattern accept()", () => {
        const cmd = new CreateTableCommand({ table: "users" });
        assert.equal(cmd.type, "createTable");

        const visitor = {
            visited: [],
            visitCreateTable(c) {
                this.visited.push(c.type);
                return "visited_create";
            }
        };

        const result = cmd.accept(visitor);
        assert.equal(result, "visited_create");
        assert.deepEqual(visitor.visited, ["createTable"]);
    });

    test("ColumnDefinition supports generic options alongside attributes", () => {
        const col = new ColumnDefinition("string", "name");
        col.option("virtual", true).option("generated", "ALWAYS AS (first_name || ' ' || last_name)");

        assert.equal(col.getOption("virtual"), true);
        assert.equal(col.getOption("generated").includes("first_name"), true);
        assert.equal(col.getOption("missing", "default_val"), "default_val");
    });

    test("Blueprint supports validation layer (blueprint.validate())", () => {
        const validTable = new Blueprint("users");
        validTable.string("name");
        assert.equal(validTable.validate(), true);

        const emptyTable = new Blueprint("");
        assert.throws(() => emptyTable.validate(), /Table name must be a non-empty string/);

        const invalidColTable = new Blueprint("invalid");
        invalidColTable.addColumn("string", "");
        assert.throws(() => invalidColTable.validate(), /Column name cannot be empty/);
    });

    test("Blueprint supports deep cloning (blueprint.clone())", () => {
        const table = new Blueprint("orders");
        table.setConnection("analytics");
        table.string("code").option("internal", true);
        table.index("code");

        const copy = table.clone();
        assert.equal(copy.table, "orders");
        assert.equal(copy.connectionName, "analytics");
        assert.equal(copy.columns.length, 1);
        assert.equal(copy.columns[0].getOption("internal"), true);

        // Verify clone independence
        copy.string("status");
        assert.equal(copy.columns.length, 2);
        assert.equal(table.columns.length, 1);
    });

    test("Blueprint supports custom NamingStrategy", () => {
        class CustomNamingStrategy extends NamingStrategy {
            createIndexName(table, type, columns) {
                const cols = Array.isArray(columns) ? columns : [columns];
                return `custom_${table}_${cols.join("_")}`;
            }
        }

        const table = new Blueprint("products");
        table.setNamingStrategy(new CustomNamingStrategy());
        table.index("category_id");

        assert.equal(table.commands[0].indexName, "custom_products_category_id");
    });
});
