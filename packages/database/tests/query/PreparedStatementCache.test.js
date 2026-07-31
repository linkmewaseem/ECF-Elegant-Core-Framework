import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import PreparedStatementCache from "../../src/query/cache/PreparedStatementCache.js";

describe("PreparedStatementCache", () => {
    let statementCache;
    const mockConnection = { name: "test_conn" };

    beforeEach(() => {
        statementCache = new PreparedStatementCache(mockConnection);
    });

    test("pools and reuses prepared statement handles on active connection", () => {
        const sql = 'SELECT * FROM "users" WHERE "id" = ?';

        assert.equal(statementCache.get(sql), null);
        assert.equal(statementCache.misses, 1);

        statementCache.put(sql, { stmtId: 101 });

        const cached = statementCache.get(sql);
        assert.notEqual(cached, null);
        assert.deepEqual(cached.handle, { stmtId: 101 });
        assert.equal(statementCache.hits, 1);
    });
});
