import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import {
    Application,
    Facade,
    CoreServiceProvider,
    ConfigServiceProvider,
    LoggerServiceProvider,
} from "@ecfjs/core";
import { EventServiceProvider } from "@ecfjs/events";
import { HttpServiceProvider } from "@ecfjs/http";
import { ViewServiceProvider } from "@ecfjs/view";
import { DatabaseServiceProvider } from "@ecfjs/database";
import { AuthServiceProvider } from "@ecfjs/auth";
import { CacheServiceProvider } from "@ecfjs/cache";
import { QueueServiceProvider } from "@ecfjs/queue";
import { StorageServiceProvider } from "@ecfjs/storage";
import { MailServiceProvider } from "@ecfjs/mail";
import { NotificationServiceProvider } from "@ecfjs/notifications";
import { BroadcastServiceProvider } from "@ecfjs/broadcast";
import { SchedulerServiceProvider } from "@ecfjs/scheduler";
import { SearchServiceProvider } from "@ecfjs/search";
import { AiServiceProvider } from "@ecfjs/ai";
import { ObservabilityServiceProvider } from "@ecfjs/observability";
import { UploadServiceProvider } from "@ecfjs/upload";
import { MediaServiceProvider } from "@ecfjs/media";
import { ApiServiceProvider } from "@ecfjs/api";
import providers from "./providers.js";
import registerWebRoutes from "../routes/web.js";
import registerApiRoutes from "../routes/api.js";
import registerHealthRoutes from "../routes/health.js";

import databaseConfig from "../config/database.js";
import authConfig from "../config/auth.js";
import mailConfig from "../config/mail.js";
import sessionConfig from "../config/session.js";
import cacheConfig from "../config/cache.js";
import viewConfig from "../config/view.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Auto-hydrate process.env from .env file if available
const envPath = path.resolve(rootDir, ".env");
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
            const idx = trimmed.indexOf("=");
            const key = trimmed.slice(0, idx).trim();
            let val = trimmed.slice(idx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            process.env[key] = val;
        }
    }
}

/**
 * Creates and boots the ECF SSR Application instance.
 */
export function createApp() {
    const app = new Application();

    // Core framework services
    app.register(CoreServiceProvider);
    app.register(ConfigServiceProvider);
    app.register(LoggerServiceProvider);
    app.register(EventServiceProvider);

    // Configure all services from config files
    app.configure({
        database: databaseConfig,
        auth: authConfig,
        mail: mailConfig,
        session: sessionConfig,
        cache: cacheConfig,
        view: {
            ...viewConfig,
            path: path.resolve(rootDir, viewConfig.path),
        },
    });

    // Infrastructure services
    app.register(DatabaseServiceProvider);
    app.register(AuthServiceProvider);
    app.register(CacheServiceProvider);
    app.register(QueueServiceProvider);
    app.register(StorageServiceProvider);
    app.register(MailServiceProvider);
    app.register(NotificationServiceProvider);
    app.register(BroadcastServiceProvider);
    app.register(SchedulerServiceProvider);
    app.register(SearchServiceProvider);
    app.register(AiServiceProvider);
    app.register(ObservabilityServiceProvider);
    app.register(UploadServiceProvider);
    app.register(MediaServiceProvider);
    app.register(ApiServiceProvider);

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
