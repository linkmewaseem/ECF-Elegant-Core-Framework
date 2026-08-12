import {
    Application,
    Facade,
    CoreServiceProvider,
    ConfigServiceProvider,
    LoggerServiceProvider,
} from "@ecfjs/core";
import { HttpServiceProvider } from "@ecfjs/http";
import { DatabaseServiceProvider } from "@ecfjs/database";
import { AuthServiceProvider } from "@ecfjs/auth";
import providers from "./providers.js";
import registerApiRoutes from "../routes/api.js";
import registerHealthRoutes from "../routes/health.js";
import Cors from "../app/Http/Middleware/Cors.js";

/**
 * Creates and boots the ECF API Application instance.
 * No ViewServiceProvider here — this blueprint only ever returns JSON.
 * If you need HTML pages too, use the `ssr` blueprint instead.
 */
export function createApp() {
    const app = new Application();

    app.register(CoreServiceProvider);
    app.register(ConfigServiceProvider);
    app.register(LoggerServiceProvider);
    app.register(DatabaseServiceProvider);
    app.register(AuthServiceProvider); // JWT guard by default — see config/auth.js
    app.register(HttpServiceProvider);

    for (const ProviderClass of providers) {
        app.register(ProviderClass);
    }

    app.boot();
    Facade.setApplication(app);

    app.use(new Cors());

    registerApiRoutes();
    registerHealthRoutes();

    return app;
}

export default createApp;
