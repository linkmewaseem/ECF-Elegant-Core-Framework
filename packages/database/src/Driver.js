export default class Driver {
    constructor(config = {}) {
        this.config = config;
        this.connected = false;
        this.supports = {
            transactions: true,
            returning: false,
            json: true,
            savepoints: false
        };
    }

    async connect() {
        this.connected = true;
    }

    async disconnect() {
        this.connected = false;
    }

    async query(sql, bindings = []) {
        throw new Error(`[Driver] query() must be implemented by subclass.`);
    }

    async execute(sql, bindings = []) {
        return this.query(sql, bindings);
    }

    async beginTransaction() {
        throw new Error(`[Driver] beginTransaction() must be implemented by subclass.`);
    }

    async commit() {
        throw new Error(`[Driver] commit() must be implemented by subclass.`);
    }

    async rollback() {
        throw new Error(`[Driver] rollback() must be implemented by subclass.`);
    }

    async ping() {
        return this.connected;
    }

    escapeIdentifier(identifier) {
        if (typeof identifier !== "string") return "";
        return `"${identifier.replace(/"/g, '""')}"`;
    }

    quote(value) {
        if (value === null || value === undefined) return "NULL";
        if (typeof value === "number") return String(value);
        if (typeof value === "boolean") return value ? "1" : "0";
        return `'${String(value).replace(/'/g, "''")}'`;
    }

    /**
     * Helper to return standardized ECF query result format.
     */
    normalizeResult({ rows = [], rowCount = null, insertId = null, affectedRows = 0 } = {}) {
        return {
            rows: Array.isArray(rows) ? rows : [],
            rowCount: rowCount !== null ? Number(rowCount) : (Array.isArray(rows) ? rows.length : 0),
            insertId: insertId !== undefined ? insertId : null,
            affectedRows: Number(affectedRows || 0)
        };
    }
}
