export default class DatabaseManager {
    #manager;

    constructor(connectionManager) {
        this.#manager = connectionManager;
    }

    get manager() {
        return this.#manager;
    }

    connection(name = null) {
        return this.#manager.connection(name);
    }

    registerDriver(name, DriverClass) {
        this.#manager.registerDriver(name, DriverClass);
        return this;
    }

    async query(sql, bindings = []) {
        return this.connection().query(sql, bindings);
    }

    async select(sql, bindings = []) {
        return this.connection().select(sql, bindings);
    }

    async insert(sql, bindings = []) {
        return this.connection().insert(sql, bindings);
    }

    async update(sql, bindings = []) {
        return this.connection().update(sql, bindings);
    }

    async delete(sql, bindings = []) {
        return this.connection().delete(sql, bindings);
    }

    async transaction(callback) {
        return this.connection().transaction(callback);
    }

    async disconnect(name = null) {
        return this.#manager.disconnect(name);
    }

    async disconnectAll() {
        return this.#manager.disconnectAll();
    }
}
