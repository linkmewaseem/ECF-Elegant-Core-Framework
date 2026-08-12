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

        let pgModule;
        try {
            pgModule = await import("pg");
        } catch {
            try {
                const { createRequire } = await import("node:module");
                const { pathToFileURL } = await import("node:url");
                const path = await import("node:path");
                const req = createRequire(path.join(process.cwd(), "package.json"));
                const resolved = req.resolve("pg");
                pgModule = await import(pathToFileURL(resolved).href);
            } catch {
                if (this.config.useMock || process.env.NODE_ENV === "test") {
                    this.#client = this.createMockClient();
                    this.connected = true;
                    return;
                }
                throw new ConnectionException('PostgreSQL client library "pg" is not installed. Please run `npm install pg`.');
            }
        }

        try {
            const Client = pgModule.default?.Client || pgModule.Client;
            const pgConfig = {
                ...this.config,
                user: this.config.user || this.config.username || "postgres",
                password: String(this.config.password ?? ""),
            };
            this.#client = new Client(pgConfig);
            await this.#client.connect();
            this.connected = true;
        } catch (err) {
            if (this.config.useMock) {
                this.#client = this.createMockClient();
                this.connected = true;
                return;
            }
            const host = this.config.host || "127.0.0.1";
            const port = this.config.port || 5432;
            const db = this.config.database || "";
            throw new ConnectionException(`Failed to connect to PostgreSQL database "${db}" at ${host}:${port}: ${err.message}`, err);
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
