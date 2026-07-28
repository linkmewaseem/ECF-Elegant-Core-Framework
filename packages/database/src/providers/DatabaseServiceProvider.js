import { ServiceProvider } from "@ecf/core";
import ConnectionManager from "../ConnectionManager.js";
import DatabaseManager from "../DatabaseManager.js";

export default class DatabaseServiceProvider extends ServiceProvider {
    register(app = this.app) {
        const container = app || this.app;
        if (!container) return;

        container.singleton("db.manager", (c) => {
            const config = c.has("config") ? c.make("config").get("database", {}) : {};
            const eventDispatcher = c.has("events") ? c.make("events") : (c.has("event.manager") ? c.make("event.manager") : null);
            return new ConnectionManager(config, eventDispatcher);
        });

        container.singleton("db", (c) => {
            const connectionManager = c.make("db.manager");
            return new DatabaseManager(connectionManager);
        });

        if (typeof container.alias === "function") {
            container.alias("db", DatabaseManager);
        }
    }
}
