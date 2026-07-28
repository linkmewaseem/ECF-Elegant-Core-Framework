import Connection from "./Connection.js";
import SQLiteDriver from "./drivers/SQLiteDriver.js";
import MySQLDriver from "./drivers/MySQLDriver.js";
import PostgreSQLDriver from "./drivers/PostgreSQLDriver.js";
import { ConnectionException } from "./exceptions/DatabaseExceptions.js";

export default class ConnectionManager {
    #drivers = new Map();
    #connections = new Map();
    #config = {};
    #defaultConnection = "default";
    #eventDispatcher = null;

    constructor(config = {}, eventDispatcher = null) {
        this.#config = config;
        this.#eventDispatcher = eventDispatcher;
        this.#defaultConnection = config.default || "sqlite";

        this.registerDefaultDrivers();
    }

    registerDefaultDrivers() {
        this.registerDriver("sqlite", SQLiteDriver);
        this.registerDriver("mysql", MySQLDriver);
        this.registerDriver("pgsql", PostgreSQLDriver);
        this.registerDriver("postgres", PostgreSQLDriver);
    }

    /**
     * Dynamically register a custom driver class.
     * @param {string} name 
     * @param {Class} DriverClass 
     */
    registerDriver(name, DriverClass) {
        if (typeof name !== "string" || !name.trim()) return this;
        this.#drivers.set(name.trim().toLowerCase(), DriverClass);
        return this;
    }

    getDefaultConnection() {
        return this.#defaultConnection;
    }

    setDefaultConnection(name) {
        this.#defaultConnection = name;
    }

    setEventDispatcher(dispatcher) {
        this.#eventDispatcher = dispatcher;
        for (const conn of this.#connections.values()) {
            conn.setEventDispatcher(dispatcher);
        }
    }

    /**
     * Get or create a Connection instance by name.
     * @param {string} name 
     * @returns {Connection}
     */
    connection(name = null) {
        const connName = name || this.#defaultConnection;

        if (this.#connections.has(connName)) {
            return this.#connections.get(connName);
        }

        const connConfig = this.#config.connections?.[connName] ?? (
            connName === "sqlite" ? { driver: "sqlite", database: ":memory:" } :
            connName === "mysql" ? { driver: "mysql" } :
            connName === "pgsql" || connName === "postgres" ? { driver: "pgsql" } :
            { driver: connName }
        );

        const driverName = (connConfig.driver || connName).toLowerCase();
        const DriverClass = this.#drivers.get(driverName);

        if (!DriverClass) {
            throw new ConnectionException(`Database driver "${driverName}" is not registered.`);
        }

        const driverInstance = new DriverClass(connConfig);
        const connectionInstance = new Connection(connName, driverInstance, this.#eventDispatcher);

        this.#connections.set(connName, connectionInstance);
        return connectionInstance;
    }

    async disconnect(name = null) {
        const connName = name || this.#defaultConnection;
        if (this.#connections.has(connName)) {
            const conn = this.#connections.get(connName);
            await conn.disconnect();
            this.#connections.delete(connName);
        }
    }

    async disconnectAll() {
        for (const [name, conn] of this.#connections.entries()) {
            await conn.disconnect();
        }
        this.#connections.clear();
    }
}
