/**
 * Interface IBulkExecutor
 * Dialect-specific high-throughput batch operations contract.
 */
export default class IBulkExecutor {
    insertMany(records, chunkSize = 500) { throw new Error("Method insertMany() must be implemented."); }
    insertIgnore(records, chunkSize = 500) { throw new Error("Method insertIgnore() must be implemented."); }
    replace(records, chunkSize = 500) { throw new Error("Method replace() must be implemented."); }
    updateMany(records, keyColumn = "id", chunkSize = 500) { throw new Error("Method updateMany() must be implemented."); }
    upsert(records, uniqueKeys, updateColumns, chunkSize = 500) { throw new Error("Method upsert() must be implemented."); }
    sync(records, keyColumn = "id") { throw new Error("Method sync() must be implemented."); }
    deleteMany(idsArray, chunkSize = 500) { throw new Error("Method deleteMany() must be implemented."); }
    chunkInsert(records, chunkSize, callback) { throw new Error("Method chunkInsert() must be implemented."); }
    chunkUpdate(criteria, values, chunkSize) { throw new Error("Method chunkUpdate() must be implemented."); }
}
