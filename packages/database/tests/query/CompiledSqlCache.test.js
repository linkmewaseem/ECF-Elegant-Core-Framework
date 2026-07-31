import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import CompiledSqlCache from "../../src/query/cache/CompiledSqlCache.js";
import SQLiteGrammar from "../../src/query/grammars/SQLiteGrammar.js";
import PostgreSQLGrammar from "../../src/query/grammars/PostgreSQLGrammar.js";

describe("CompiledSqlCache Engine", () => {
    let cache;
    let sqliteGrammar;
    let pgGrammar;

    beforeEach(() => {
        cache = new CompiledSqlCache();
        sqliteGrammar = new SQLiteGrammar();
        pgGrammar = new PostgreSQLGrammar();
    });

    test("caches AST SQL compilation and achieves >= 99% hit rate for repeated structures", () => {
        const ast = {
            table: "users",
            columns: ["id", "name"],
            wheres: [{ type: "basic", column: "status", operator: "=", value: "active", boolean: "AND" }]
        };

        const res1 = cache.getOrCompile(ast, sqliteGrammar);
        assert.equal(cache.misses, 1);
        assert.equal(cache.hits, 0);

        for (let i = 0; i < 99; i++) {
            const astRun = {
                table: "users",
                columns: ["id", "name"],
                wheres: [{ type: "basic", column: "status", operator: "=", value: `val_${i}`, boolean: "AND" }]
            };
            cache.getOrCompile(astRun, sqliteGrammar);
        }

        assert.equal(cache.hits, 99);
        assert.ok(cache.hitRate >= 0.99);
    });

    test("compiles single AST into dialect-specific cached SQL for SQLite and PostgreSQL", () => {
        const ast = {
            table: "users",
            columns: ["id", "email"],
            wheres: [{ type: "basic", column: "id", operator: "=", value: 10, boolean: "AND" }]
        };

        const sqliteRes = cache.getOrCompile(ast, sqliteGrammar);
        const pgRes = cache.getOrCompile(ast, pgGrammar);

        assert.ok(sqliteRes.sql.includes('SELECT "id", "email" FROM "users" WHERE "id" = ?'));
        assert.ok(pgRes.sql.includes('SELECT "id", "email" FROM "users" WHERE "id" = $1'));
    });
});
