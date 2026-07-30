import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Blueprint from "../src/schema/Blueprint.js";
import CompiledStatement from "../src/schema/CompiledStatement.js";
import SQLiteSchemaGrammar from "../src/schema/grammars/SQLiteSchemaGrammar.js";
import MySQLSchemaGrammar from "../src/schema/grammars/MySQLSchemaGrammar.js";
import PostgreSQLSchemaGrammar from "../src/schema/grammars/PostgreSQLSchemaGrammar.js";

describe("SchemaGrammar DDL Compilers", () => {
    test("SQLiteSchemaGrammar compiles CREATE TABLE with SQLite data types and identifiers", () => {
        const grammar = new SQLiteSchemaGrammar();
        const table = new Blueprint("users", (t) => {
            t.create();
            t.id();
            t.string("name");
            t.string("email").nullable();
            t.boolean("is_active").default(true);
        });

        const sqls = grammar.compile(table);
        assert.equal(sqls.length, 1);
        assert.equal(sqls[0] instanceof CompiledStatement, true);
        assert.equal(
            sqls[0].sql,
            'CREATE TABLE "users" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "name" VARCHAR(255) NOT NULL, "email" VARCHAR(255) NULL, "is_active" INTEGER NOT NULL DEFAULT 1)'
        );
        assert.deepEqual(sqls[0].bindings, []);
    });

    test("MySQLSchemaGrammar compiles CREATE TABLE with backticks and AUTO_INCREMENT", () => {
        const grammar = new MySQLSchemaGrammar();
        const table = new Blueprint("users", (t) => {
            t.create();
            t.id();
            t.string("name", 150);
            t.boolean("is_admin").default(false);
        });

        const sqls = grammar.compile(table);
        assert.equal(sqls.length, 1);
        assert.equal(sqls[0] instanceof CompiledStatement, true);
        assert.equal(
            sqls[0].sql,
            "CREATE TABLE `users` (`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, `name` VARCHAR(150) NOT NULL, `is_admin` TINYINT(1) NOT NULL DEFAULT 0)"
        );
    });

    test("PostgreSQLSchemaGrammar compiles CREATE TABLE with double quotes and BIGSERIAL", () => {
        const grammar = new PostgreSQLSchemaGrammar();
        const table = new Blueprint("users", (t) => {
            t.create();
            t.id();
            t.string("name");
            t.json("metadata");
            t.uuid("user_uuid");
        });

        const sqls = grammar.compile(table);
        assert.equal(sqls.length, 1);
        assert.equal(sqls[0] instanceof CompiledStatement, true);
        assert.equal(
            sqls[0].sql,
            'CREATE TABLE "users" ("id" BIGSERIAL PRIMARY KEY, "name" VARCHAR(255) NOT NULL, "metadata" JSONB NOT NULL, "user_uuid" UUID NOT NULL)'
        );
    });

    test("Grammar supports flags dictate capability behavior", () => {
        const sqliteGrammar = new SQLiteSchemaGrammar();
        const mysqlGrammar = new MySQLSchemaGrammar();

        assert.equal(sqliteGrammar.supports.after, false);
        assert.equal(mysqlGrammar.supports.after, true);

        const table = new Blueprint("posts");
        table.string("subtitle").after("title");

        const mysqlSql = mysqlGrammar.compileColumn(table.columns[0]);
        assert.equal(mysqlSql.includes("AFTER `title`"), true);

        const sqliteSql = sqliteGrammar.compileColumn(table.columns[0]);
        assert.equal(sqliteSql.includes("AFTER"), false);
    });

    test("Compiles alter table commands (add column, drop column, rename column, indexes, foreign keys)", () => {
        const grammar = new SQLiteSchemaGrammar();
        const table = new Blueprint("users");
        table.string("phone");
        table.dropColumn("age");
        table.renameColumn("old_name", "new_name");
        table.index("email");

        const sqls = grammar.compile(table);
        assert.equal(sqls.length, 4);
        assert.equal(sqls[0].sql, 'ALTER TABLE "users" ADD COLUMN "phone" VARCHAR(255) NOT NULL');
        assert.equal(sqls[1].sql, 'ALTER TABLE "users" DROP COLUMN "age"');
        assert.equal(sqls[2].sql, 'ALTER TABLE "users" RENAME COLUMN "old_name" TO "new_name"');
        assert.equal(sqls[3].sql, 'CREATE INDEX "users_email_index" ON "users" ("email")');
    });

    test("Grammar validates Blueprint before compilation", () => {
        const grammar = new SQLiteSchemaGrammar();
        const invalidTable = new Blueprint("");

        assert.throws(() => grammar.compile(invalidTable), /Table name must be a non-empty string/);
    });
});
