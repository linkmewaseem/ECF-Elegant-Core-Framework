import MigrationLoader from "./MigrationLoader.js";

export default class Migrator {
    #repository;
    #connection;
    #loader;

    constructor(repository, connection, loader = null) {
        this.#repository = repository;
        this.#connection = connection;
        this.#loader = loader || new MigrationLoader();
    }

    get repository() {
        return this.#repository;
    }

    get connection() {
        return this.#connection;
    }

    get loader() {
        return this.#loader;
    }

    /**
     * Alias for run().
     */
    async migrate(paths, options = {}) {
        return this.run(paths, options);
    }

    /**
     * Run all pending migrations.
     */
    async run(paths, options = {}) {
        await this.#repository.createRepository();

        const files = await this.#loader.load(paths);
        const ran = await this.#repository.getRan();

        const pending = files.filter(f => !ran.includes(f.name));
        if (pending.length === 0) {
            return { ran: [], batch: null };
        }

        const batch = await this.#repository.getNextBatchNumber();
        const executed = [];

        for (const item of pending) {
            const targetConnection = this.#resolveConnectionForItem(item);
            targetConnection.dispatchEvent("MigrationStarted", { migration: item.name, batch });

            try {
                await targetConnection.transaction(async (conn) => {
                    const schema = conn.getSchemaBuilder();
                    if (typeof item.instance?.up === "function") {
                        await item.instance.up(schema);
                    }
                    await this.#repository.log(
                        item.name,
                        batch,
                        options.module || "app",
                        options.checksum || null
                    );
                });
            } catch (error) {
                targetConnection.dispatchEvent("MigrationFailed", { migration: item.name, batch, error });
                throw error;
            }

            targetConnection.dispatchEvent("MigrationExecuted", { migration: item.name, batch });
            targetConnection.dispatchEvent("MigrationFinished", { migration: item.name, batch });
            executed.push(item.name);
        }

        return { ran: executed, batch };
    }

    /**
     * Rollback the last batch (or specified steps) of migrations.
     */
    async rollback(paths, options = {}) {
        await this.#repository.createRepository();

        const files = await this.#loader.load(paths);
        const fileMap = new Map(files.map(f => [f.name, f]));

        const ranRecords = await this.#repository.getLast(options.steps);
        if (!ranRecords || ranRecords.length === 0) {
            return { rolledBack: [] };
        }

        const rolledBack = [];

        for (const record of ranRecords) {
            const fileItem = fileMap.get(record.migration);
            const targetConnection = fileItem ? this.#resolveConnectionForItem(fileItem) : this.#connection;
            targetConnection.dispatchEvent("RollbackStarted", { migration: record.migration, batch: record.batch });

            if (fileItem && typeof fileItem.instance?.down === "function") {
                try {
                    await targetConnection.transaction(async (conn) => {
                        const schema = conn.getSchemaBuilder();
                        await fileItem.instance.down(schema);
                        await this.#repository.delete(record.migration);
                    });
                } catch (error) {
                    targetConnection.dispatchEvent("MigrationFailed", { migration: record.migration, batch: record.batch, error });
                    throw error;
                }
            } else {
                // If migration file no longer exists on disk, delete database tracking entry
                await this.#repository.delete(record.migration);
            }

            targetConnection.dispatchEvent("RollbackExecuted", { migration: record.migration, batch: record.batch });
            targetConnection.dispatchEvent("MigrationRolledBack", { migration: record.migration, batch: record.batch });
            rolledBack.push(record.migration);
        }

        return { rolledBack };
    }

    /**
     * Reset all executed migrations.
     */
    async reset(paths) {
        const allRolledBack = [];
        let result = await this.rollback(paths);

        while (result.rolledBack && result.rolledBack.length > 0) {
            allRolledBack.push(...result.rolledBack);
            result = await this.rollback(paths);
        }

        return { rolledBack: allRolledBack };
    }

    /**
     * Reset and re-run all migrations.
     */
    async refresh(paths, options = {}) {
        const resetResult = await this.reset(paths);
        const runResult = await this.run(paths, options);

        return {
            rolledBack: resetResult.rolledBack,
            ran: runResult.ran,
            batch: runResult.batch
        };
    }

    /**
     * Drop all tables in the current connection schema and re-run all migrations afresh.
     */
    async fresh(paths, options = {}) {
        await this.dropAllTables();
        return this.run(paths, options);
    }

    /**
     * Drop all tables on the current connection.
     */
    async dropAllTables() {
        const schema = this.#connection.getSchemaBuilder();
        const driverName = this.#connection.driverName;

        let tableQuery = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
        if (driverName === "mysql") {
            tableQuery = "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE()";
        } else if (driverName === "pgsql" || driverName === "postgres" || driverName === "postgresql") {
            tableQuery = "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = current_schema()";
        }

        try {
            const rows = await this.#connection.select(tableQuery);
            const tableNames = rows ? rows.map(r => r.name || r.TABLE_NAME || r.table_name).filter(Boolean) : [];

            for (const tableName of tableNames) {
                await schema.dropIfExists(tableName);
            }
        } catch {
            // Fallback: drop repository if exists
            await this.#repository.dropRepository();
        }
    }

    /**
     * Get migration status list for discovered migrations.
     */
    async status(paths) {
        await this.#repository.createRepository();

        const files = await this.#loader.load(paths);
        const ranRecords = await this.#repository.getRanRecords();
        const recordMap = new Map(ranRecords.map(r => [r.migration, r]));

        return files.map(file => {
            const rec = recordMap.get(file.name);
            return {
                name: file.name,
                ran: Boolean(rec),
                batch: rec ? rec.batch : null,
                executed_at: rec ? rec.executed_at : null
            };
        });
    }

    #resolveConnectionForItem(item) {
        if (!item || !item.instance) return this.#connection;

        const targetConnName = item.instance.connection || item.instance.connectionName;
        if (targetConnName && typeof this.#connection.getSchemaBuilder === "function") {
            try {
                // If connection method exists on connection (or container)
                return this.#connection.connection ? this.#connection.connection(targetConnName) : this.#connection;
            } catch {
                return this.#connection;
            }
        }

        return this.#connection;
    }
}
