import IBulkExecutor from "../contracts/IBulkExecutor.js";

export default class BulkOperations extends IBulkExecutor {
    #queryBuilder;

    constructor(queryBuilder) {
        super();
        this.#queryBuilder = queryBuilder;
    }

    async insertMany(records, chunkSize = 500) {
        const recordList = Array.isArray(records) ? records : [records];
        if (recordList.length === 0) return 0;

        let insertedCount = 0;
        for (let i = 0; i < recordList.length; i += chunkSize) {
            const chunk = recordList.slice(i, i + chunkSize);
            const { sql, bindings } = this.#queryBuilder.grammar.compileBulkInsert(this.#queryBuilder.ast, chunk);
            const res = await this.#queryBuilder.connection.insert(sql, bindings);
            insertedCount += (res && res.affectedRows) ? res.affectedRows : chunk.length;
        }
        return insertedCount;
    }

    async insertIgnore(records, chunkSize = 500) {
        const recordList = Array.isArray(records) ? records : [records];
        if (recordList.length === 0) return 0;

        let count = 0;
        for (let i = 0; i < recordList.length; i += chunkSize) {
            const chunk = recordList.slice(i, i + chunkSize);
            // Insert or ignore syntax (SQLite / MySQL)
            const bulkRes = this.#queryBuilder.grammar.compileBulkInsert(this.#queryBuilder.ast, chunk);
            const ignoreSql = bulkRes.sql.replace(/^INSERT INTO/i, "INSERT OR IGNORE INTO");
            const res = await this.#queryBuilder.connection.insert(ignoreSql, bulkRes.bindings);
            count += (res && res.affectedRows) ? res.affectedRows : chunk.length;
        }
        return count;
    }

    async replace(records, chunkSize = 500) {
        const recordList = Array.isArray(records) ? records : [records];
        if (recordList.length === 0) return 0;

        let count = 0;
        for (let i = 0; i < recordList.length; i += chunkSize) {
            const chunk = recordList.slice(i, i + chunkSize);
            const bulkRes = this.#queryBuilder.grammar.compileBulkInsert(this.#queryBuilder.ast, chunk);
            const replaceSql = bulkRes.sql.replace(/^INSERT INTO/i, "INSERT OR REPLACE INTO");
            const res = await this.#queryBuilder.connection.insert(replaceSql, bulkRes.bindings);
            count += (res && res.affectedRows) ? res.affectedRows : chunk.length;
        }
        return count;
    }

    async updateMany(records, keyColumn = "id", chunkSize = 500) {
        const recordList = Array.isArray(records) ? records : [records];
        if (recordList.length === 0) return 0;

        let updatedCount = 0;
        for (let i = 0; i < recordList.length; i += chunkSize) {
            const chunk = recordList.slice(i, i + chunkSize);
            for (const record of chunk) {
                const keyVal = record[keyColumn];
                if (keyVal === undefined) continue;
                const updateVals = { ...record };
                delete updateVals[keyColumn];
                const updated = await this.#queryBuilder.clone().where(keyColumn, keyVal).update(updateVals);
                updatedCount += updated;
            }
        }
        return updatedCount;
    }

    async upsert(records, uniqueKeys = ["id"], updateColumns = null, chunkSize = 500) {
        const recordList = Array.isArray(records) ? records : [records];
        if (recordList.length === 0) return 0;

        let count = 0;
        for (let i = 0; i < recordList.length; i += chunkSize) {
            const chunk = recordList.slice(i, i + chunkSize);
            const { sql, bindings } = this.#queryBuilder.grammar.compileUpsert(this.#queryBuilder.ast, chunk, uniqueKeys, updateColumns);
            const res = await this.#queryBuilder.connection.insert(sql, bindings);
            count += (res && res.affectedRows) ? res.affectedRows : chunk.length;
        }
        return count;
    }

    async sync(records, keyColumn = "id") {
        const recordList = Array.isArray(records) ? records : [records];
        const ids = recordList.map(r => r[keyColumn]).filter(id => id !== undefined && id !== null);

        if (ids.length > 0) {
            await this.#queryBuilder.clone().whereNotIn(keyColumn, ids).delete();
        } else {
            await this.#queryBuilder.clone().delete();
        }

        return this.upsert(recordList, [keyColumn]);
    }

    async deleteMany(idsArray, chunkSize = 500) {
        if (!Array.isArray(idsArray) || idsArray.length === 0) return 0;

        let deletedCount = 0;
        for (let i = 0; i < idsArray.length; i += chunkSize) {
            const chunk = idsArray.slice(i, i + chunkSize);
            const deleted = await this.#queryBuilder.clone().whereIn("id", chunk).delete();
            deletedCount += deleted;
        }
        return deletedCount;
    }

    async chunkInsert(records, chunkSize, callback) {
        const recordList = Array.isArray(records) ? records : [records];
        for (let i = 0; i < recordList.length; i += chunkSize) {
            const chunk = recordList.slice(i, i + chunkSize);
            await callback(chunk);
            await this.insertMany(chunk, chunkSize);
        }
    }

    async chunkUpdate(criteria, values, chunkSize = 500) {
        let offset = 0;
        let totalUpdated = 0;
        while (true) {
            const ids = await this.#queryBuilder.clone().where(criteria).offset(offset).limit(chunkSize).pluck("id");
            if (ids.length === 0) break;
            const updated = await this.#queryBuilder.clone().whereIn("id", ids).update(values);
            totalUpdated += updated;
            offset += chunkSize;
        }
        return totalUpdated;
    }
}
