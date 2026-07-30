export default class BatchStrategy {
    async batchQuery(relation, parentModels, constraint = null) {
        throw new Error("[BatchStrategy] batchQuery() must be implemented by concrete subclass.");
    }
}
