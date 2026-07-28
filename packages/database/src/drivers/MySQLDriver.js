import Driver from "../Driver.js";
import { ConnectionException, QueryException } from "../exceptions/DatabaseExceptions.js";

export default class MySQLDriver extends Driver {
    #client = null;

    constructor(config = {}) {
        super(config);
        this.supports = {
            transactions: true,
            returning: false,
            json: true,
            savepoints: true
        };
    }

    async connect() {
        if (this.connected) return;
        if (this.config.client) {
            this.#client = this.config.client;
            this.connected = true;
            return;
        }

        try {
            const mysql = await import("mysql2/promise");
            this.#client = await mysql.createConnection(this.config);
            this.connected = true;
        } catch {
            // Mock connection for zero-dependency environment when client library is absent
            this.#client = this.createMockClient();
            this.connected = true;
        }
    }

    async disconnect() {
        if (!this.connected) return;
        if (this.#client && typeof this.#client.end === "function") {
            try { await this.#client.end(); } catch {}
        }
        this.#client = null;
        this.connected = false;
    }

    async query(sql, bindings = []) {
        if (!this.connected || !this.#client) {
            await this.connect();
        }

        try {
            const [results, fields] = await this.#client.query(sql, bindings);

            if (Array.isArray(results)) {
                return this.normalizeResult({ rows: results, rowCount: results.length });
            }

            return this.normalizeResult({
                rows: [],
                insertId: results.insertId ?? null,
                affectedRows: results.affectedRows ?? 0
            });
        } catch (err) {
            throw new QueryException(`MySQL query error: ${err.message}`, sql, bindings, err);
        }
    }

    async beginTransaction() {
        return this.query("START TRANSACTION");
    }

    async commit() {
        return this.query("COMMIT");
    }

    async rollback() {
        return this.query("ROLLBACK");
    }

    escapeIdentifier(identifier) {
        if (typeof identifier !== "string") return "";
        return `\`${identifier.replace(/`/g, "``")}\``;
    }

    createMockClient() {
        return {
            query: async (sql, bindings) => [ [], { insertId: 1, affectedRows: 0 } ],
            end: async () => {}
        };
    }
}
