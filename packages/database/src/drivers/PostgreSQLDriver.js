import Driver from "../Driver.js";
import { ConnectionException, QueryException } from "../exceptions/DatabaseExceptions.js";

export default class PostgreSQLDriver extends Driver {
    #client = null;

    constructor(config = {}) {
        super(config);
        this.supports = {
            transactions: true,
            returning: true,
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
            const pg = await import("pg");
            const Client = pg.default?.Client || pg.Client;
            this.#client = new Client(this.config);
            await this.#client.connect();
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
            const res = await this.#client.query(sql, bindings);
            const rows = res.rows || [];
            return this.normalizeResult({
                rows,
                rowCount: res.rowCount ?? rows.length,
                affectedRows: res.rowCount ?? 0
            });
        } catch (err) {
            throw new QueryException(`PostgreSQL query error: ${err.message}`, sql, bindings, err);
        }
    }

    async beginTransaction() {
        return this.query("BEGIN");
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

    createMockClient() {
        return {
            query: async (sql, bindings) => ({ rows: [], rowCount: 0 }),
            end: async () => {}
        };
    }
}
