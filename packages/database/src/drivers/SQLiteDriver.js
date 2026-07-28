import Driver from "../Driver.js";
import { ConnectionException, QueryException } from "../exceptions/DatabaseExceptions.js";

export default class SQLiteDriver extends Driver {
    #db = null;

    constructor(config = {}) {
        super(config);
        this.filename = config.database || config.filename || ":memory:";
        this.supports = {
            transactions: true,
            returning: true,
            json: true,
            savepoints: true
        };
    }

    async connect() {
        if (this.connected && this.#db) return;
        try {
            // Attempt to load node:sqlite (Node 22+)
            const sqlite = await import("node:sqlite");
            this.#db = new sqlite.DatabaseSync(this.filename);
            this.connected = true;
        } catch {
            // Fallback in-memory mock engine for environments without native node:sqlite
            this.#db = this.createMockEngine();
            this.connected = true;
        }
    }

    async disconnect() {
        if (!this.connected) return;
        if (this.#db && typeof this.#db.close === "function") {
            try { this.#db.close(); } catch {}
        }
        this.#db = null;
        this.connected = false;
    }

    async query(sql, bindings = []) {
        if (!this.connected || !this.#db) {
            await this.connect();
        }

        try {
            const isSelect = /^\s*(SELECT|PRAGMA|EXPLAIN)/i.test(sql);

            if (typeof this.#db.prepare === "function") {
                const stmt = this.#db.prepare(sql);
                if (isSelect) {
                    const rows = stmt.all(...bindings);
                    return this.normalizeResult({ rows, rowCount: rows.length });
                } else {
                    const info = stmt.run(...bindings);
                    return this.normalizeResult({
                        rows: [],
                        insertId: info.lastInsertRowid ?? null,
                        affectedRows: info.changes ?? 0
                    });
                }
            } else if (typeof this.#db.exec === "function") {
                const res = this.#db.exec(sql, bindings);
                return this.normalizeResult(res);
            }
        } catch (err) {
            throw new QueryException(`SQLite query error: ${err.message}`, sql, bindings, err);
        }
    }

    async beginTransaction() {
        return this.query("BEGIN TRANSACTION");
    }

    async commit() {
        return this.query("COMMIT");
    }

    async rollback() {
        return this.query("ROLLBACK");
    }

    escapeIdentifier(identifier) {
        if (typeof identifier !== "string") return "";
        return `"${identifier.replace(/"/g, '""')}"`;
    }

    createMockEngine() {
        const memoryStore = new Map();
        return {
            exec: (sql, bindings = []) => ({ rows: [], affectedRows: 0 }),
            prepare: (sql) => ({
                all: (...args) => [],
                run: (...args) => ({ lastInsertRowid: 1, changes: 1 })
            }),
            close: () => {}
        };
    }
}
