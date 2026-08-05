import { ServiceProvider } from "@ecfjs/core";
import ConnectionManager from "../ConnectionManager.js";
import DatabaseManager from "../DatabaseManager.js";
import MigrationRepository from "../migrations/MigrationRepository.js";
import Migrator from "../migrations/Migrator.js";

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

        container.bind("db.schema", (c) => {
            const db = c.make("db");
            return db.schema();
        });

        container.singleton("db.migration.repository", (c) => {
            const db = c.make("db");
            return new MigrationRepository(db.connection(), "migrations");
        });

        container.singleton("db.migrator", (c) => {
            const db = c.make("db");
            const repository = c.make("db.migration.repository");
            return new Migrator(repository, db.connection());
        });

        if (typeof container.alias === "function") {
            container.alias("db", DatabaseManager);
        }
    }
}
