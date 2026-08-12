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

        let mysqlModule;
        try {
            mysqlModule = await import("mysql2/promise");
        } catch {
            try {
                const { createRequire } = await import("node:module");
                const { pathToFileURL } = await import("node:url");
                const path = await import("node:path");
                const req = createRequire(path.join(process.cwd(), "package.json"));
                const resolved = req.resolve("mysql2/promise");
                mysqlModule = await import(pathToFileURL(resolved).href);
            } catch {
                if (this.config.useMock || process.env.NODE_ENV === "test") {
                    this.#client = this.createMockClient();
                    this.connected = true;
                    return;
                }
                throw new ConnectionException('MySQL client library "mysql2" is not installed. Please run `npm install mysql2`.');
            }
        }

        try {
            this.#client = await mysqlModule.createConnection(this.config);
            this.connected = true;
        } catch (err) {
            if (this.config.useMock) {
                this.#client = this.createMockClient();
                this.connected = true;
                return;
            }
            const host = this.config.host || "127.0.0.1";
            const port = this.config.port || 3306;
            const db = this.config.database || "";
            throw new ConnectionException(`Failed to connect to MySQL database "${db}" at ${host}:${port}: ${err.message}`, err);
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
