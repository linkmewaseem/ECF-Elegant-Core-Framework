import ServiceProvider from "../ServiceProvider.js";
import ConfigManager from "../ConfigManager.js";
import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

export default class ConfigServiceProvider extends ServiceProvider {
    register(app) {
        if (!app.has("config")) {
            app.singleton("config", () => {
                const manager = new ConfigManager();
                this.loadConfigFiles(manager);
                return manager;
            });
        }
    }

    loadConfigFiles(manager) {
        try {
            const configDir = path.join(process.cwd(), "config");
            if (fs.existsSync(configDir)) {
                const files = fs.readdirSync(configDir);
                for (const file of files) {
                    if (file.endsWith(".json")) {
                        const key = file.replace(/\.json$/, "");
                        const fullPath = path.join(configDir, file);
                        const content = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
                        manager.load(key, content);
                    }
                }
            }
        } catch {
            // ignore
        }
    }

    async boot(app) {
        try {
            const manager = app.make("config");
            const configDir = path.join(process.cwd(), "config");
            if (fs.existsSync(configDir)) {
                const files = fs.readdirSync(configDir);
                for (const file of files) {
                    if (file.endsWith(".js") || file.endsWith(".mjs")) {
                        const key = file.replace(/\.(js|mjs)$/, "");
                        const fullPath = path.join(configDir, file);
                        const fileUrl = pathToFileURL(fullPath).href;
                        const module = await import(fileUrl);
                        const exported = module.default || module;
                        manager.load(key, exported);
                    }
                }
            }
        } catch {
            // ignore
        }
    }
}