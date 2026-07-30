import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Grammar from "../src/query/Grammar.js";
import SQLiteGrammar from "../src/query/grammars/SQLiteGrammar.js";
import MySQLGrammar from "../src/query/grammars/MySQLGrammar.js";
import PostgreSQLGrammar from "../src/query/grammars/PostgreSQLGrammar.js";
import Expression from "../src/query/Expression.js";
import { WhereClause, OrderClause, JoinClause, AggregateClause } from "../src/query/Clause.js";

describe("SQL Grammar Compilers", () => {
    test("compiles basic SELECT query with wheres, joins, orders, limit, and offset", () => {
        const grammar = new SQLiteGrammar();
        const ast = {
            table: "users",
            columns: ["id", "name", "email"],
            wheres: [
                new WhereClause({ column: "status", operator: "=", value: "active" }),
                new WhereClause({ type: "in", column: "role", value: ["admin", "editor"], boolean: "AND" }),
                new WhereClause({ type: "null", column: "deleted_at", boolean: "AND" })
            ],
            joins: [
                new JoinClause({ type: "LEFT", table: "profiles", first: "users.id", operator: "=", second: "profiles.user_id" })
            ],
            orders: [
                new OrderClause("created_at", "DESC")
            ],
            limit: 10,
            offset: 20
        };

        const { sql, bindings } = grammar.compileSelect(ast);

        assert.equal(
            sql,
            'SELECT "id", "name", "email" FROM "users" LEFT JOIN "profiles" ON "users"."id" = "profiles"."user_id" WHERE "status" = ? AND "role" IN (?, ?) AND "deleted_at" IS NULL ORDER BY "created_at" DESC LIMIT 10 OFFSET 20'
        );
        assert.deepEqual(bindings, ["active", "admin", "editor"]);
    });

    test("compiles empty select columns to SELECT *", () => {
        const grammar = new SQLiteGrammar();
        const ast = { table: "users", columns: [] };
        const { sql } = grammar.compileSelect(ast);

        assert.equal(sql, 'SELECT * FROM "users"');
    });

    test("MySQLGrammar uses backticks for quoting", () => {
        const grammar = new MySQLGrammar();
        const ast = { table: "orders", columns: ["id", "total"] };
        const { sql } = grammar.compileSelect(ast);

        assert.equal(sql, "SELECT `id`, `total` FROM `orders`");
    });

    test("PostgreSQLGrammar parameterizes placeholders with $1, $2", () => {
        const grammar = new PostgreSQLGrammar();
        const ast = {
            table: "products",
            columns: ["id", "price"],
            wheres: [
                new WhereClause({ column: "category", operator: "=", value: "tech" }),
                new WhereClause({ column: "price", operator: ">=", value: 100 })
            ]
        };

        const { sql, bindings } = grammar.compileSelect(ast);

        assert.equal(sql, 'SELECT "id", "price" FROM "products" WHERE "category" = $1 AND "price" >= $2');
        assert.deepEqual(bindings, ["tech", 100]);
    });

    test("compiles aggregate function clauses", () => {
        const grammar = new SQLiteGrammar();
        const ast = {
            table: "users",
            aggregate: new AggregateClause("count", "*")
        };

        const { sql } = grammar.compileSelect(ast);
        assert.equal(sql, 'SELECT COUNT(*) FROM "users"');
    });

    test("compiles INSERT, UPDATE, DELETE, and TRUNCATE statements", () => {
        const grammar = new SQLiteGrammar();
        const ast = { table: "users", wheres: [new WhereClause({ column: "id", operator: "=", value: 5 })] };

        // Insert
        const insertRes = grammar.compileInsert({ table: "users" }, { name: "Alice", email: "alice@ecf.dev" });
        assert.equal(insertRes.sql, 'INSERT INTO "users" ("name", "email") VALUES (?, ?)');
        assert.deepEqual(insertRes.bindings, ["Alice", "alice@ecf.dev"]);

        // Update
        const updateRes = grammar.compileUpdate(ast, { name: "Alice Updated" });
        assert.equal(updateRes.sql, 'UPDATE "users" SET "name" = ? WHERE "id" = ?');
        assert.deepEqual(updateRes.bindings, ["Alice Updated", 5]);

        // Delete
        const deleteRes = grammar.compileDelete(ast);
        assert.equal(deleteRes.sql, 'DELETE FROM "users" WHERE "id" = ?');

        // Truncate (SQLite fallback)
        const truncRes = grammar.compileTruncate({ table: "users" });
        assert.equal(truncRes.sql, 'DELETE FROM "users"');
    });
});
