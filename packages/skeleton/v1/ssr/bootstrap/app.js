import { fileURLToPath } from "node:url";
import path from "node:path";
import {
    Application,
    Facade,
    CoreServiceProvider,
    ConfigServiceProvider,
    LoggerServiceProvider,
} from "@ecfjs/core";
import { HttpServiceProvider, Route } from "@ecfjs/http";
import { ViewServiceProvider } from "@ecfjs/view";
import { DatabaseServiceProvider } from "@ecfjs/database";
import { AuthServiceProvider } from "@ecfjs/auth";
import providers from "./providers.js";
import registerWebRoutes from "../routes/web.js";
import registerApiRoutes from "../routes/api.js";
import registerHealthRoutes from "../routes/health.js";
import viewConfig from "../config/view.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

/**
 * Creates and boots the ECF SSR Application instance.
 */
export function createApp() {
    const app = new Application();

    // Core framework services
    app.register(CoreServiceProvider);
    app.register(LoggerServiceProvider);

    // Configure views relative to app root
    app.configure({
        view: {
            ...viewConfig,
            path: path.resolve(rootDir, viewConfig.path),
        },
    });

    // Data layer
    app.register(DatabaseServiceProvider);

    // Auth (session-based by default for SSR — see config/auth.js)
    app.register(AuthServiceProvider);

    // HTTP + View (SSR-specific)
    app.register(HttpServiceProvider);
    app.register(ViewServiceProvider);

    // App-specific providers (bindings you add yourself)
    for (const ProviderClass of providers) {
        app.register(ProviderClass);
    }

    app.boot();
    Facade.setApplication(app);

    // Routes are registered AFTER the facade is ready
    registerWebRoutes();
    registerApiRoutes();
    registerHealthRoutes();

    return app;
}

export default createApp;

