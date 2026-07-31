export default class PreparedStatementCache {
    #statements = new Map();
    #connection;
    #hits = 0;
    #misses = 0;

    constructor(connection) {
        this.#connection = connection;
    }

    get hits() { return this.#hits; }
    get misses() { return this.#misses; }
    get size() { return this.#statements.size; }

    has(sql) {
        return this.#statements.has(sql);
    }

    get(sql) {
        if (this.#statements.has(sql)) {
            this.#hits++;
            const stmt = this.#statements.get(sql);
            stmt.lastUsed = Date.now();
            stmt.useCount++;
            return stmt;
        }
        this.#misses++;
        return null;
    }

    put(sql, handle) {
        const stmt = {
            sql,
            handle,
            created: Date.now(),
            lastUsed: Date.now(),
            useCount: 1
        };
        this.#statements.set(sql, stmt);
        return stmt;
    }

    clear() {
        this.#statements.clear();
        this.#hits = 0;
        this.#misses = 0;
    }
}
