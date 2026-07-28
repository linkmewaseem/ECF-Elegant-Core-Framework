import ServiceProvider from "../ServiceProvider.js";

class Database {
    constructor() {
        this.connected = false;
    }
}

export default class DatabaseServiceProvider extends ServiceProvider {
    register(app = this.app) {
        const container = app || this.app;
        if (!container) return;

        container.singleton("database", () => new Database());
        container.singleton("db", (c) => c.make("database"));
    }

    boot(app = this.app) {}
}