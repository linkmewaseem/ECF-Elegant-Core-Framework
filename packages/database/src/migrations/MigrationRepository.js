export default class MigrationRepository {
    #connection;
    #table;

    constructor(connection, table = "migrations") {
        this.#connection = connection;
        this.#table = table;
    }

    get table() {
        return this.#table;
    }

    get connection() {
        return this.#connection;
    }

    async repositoryExists() {
        return this.#connection.getSchemaBuilder().hasTable(this.#table);
    }

    async createRepository() {
        const schema = this.#connection.getSchemaBuilder();
        const exists = await schema.hasTable(this.#table);

        if (!exists) {
            await schema.create(this.#table, (table) => {
                table.id();
                table.string("migration");
                table.integer("batch");
                table.string("module").default("app");
                table.string("checksum").nullable();
                table.timestamp("executed_at").nullable();
            });
        }
    }

    async dropRepository() {
        const schema = this.#connection.getSchemaBuilder();
        if (await schema.hasTable(this.#table)) {
            await schema.drop(this.#table);
        }
    }

    async getRan() {
        if (!(await this.repositoryExists())) {
            return [];
        }

        const rows = await this.#connection
            .table(this.#table)
            .orderBy("id", "ASC")
            .pluck("migration");

        return rows || [];
    }

    async getLastBatchNumber() {
        if (!(await this.repositoryExists())) {
            return 0;
        }

        const maxBatch = await this.#connection
            .table(this.#table)
            .max("batch");

        return maxBatch ? Number(maxBatch) : 0;
    }

    async getNextBatchNumber() {
        return (await this.getLastBatchNumber()) + 1;
    }

    async getRanRecords() {
        if (!(await this.repositoryExists())) {
            return [];
        }

        return this.#connection
            .table(this.#table)
            .orderBy("id", "ASC")
            .get();
    }

    async getLast(steps = null) {
        if (!(await this.repositoryExists())) {
            return [];
        }

        let query = this.#connection.table(this.#table);

        if (steps !== null && steps !== undefined && Number.isFinite(Number(steps)) && Number(steps) > 0) {
            query = query.orderBy("id", "DESC").limit(Number(steps));
        } else {
            const lastBatch = await this.getLastBatchNumber();
            if (lastBatch === 0) return [];
            query = query.where("batch", lastBatch).orderBy("id", "DESC");
        }

        return query.get();
    }

    async log(migration, batch, module = "app", checksum = null) {
        return this.#connection.table(this.#table).insert({
            migration,
            batch,
            module,
            checksum,
            executed_at: new Date().toISOString()
        });
    }

    async delete(migration) {
        return this.#connection
            .table(this.#table)
            .where("migration", migration)
            .delete();
    }
}
