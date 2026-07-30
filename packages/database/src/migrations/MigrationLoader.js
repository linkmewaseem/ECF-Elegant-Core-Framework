import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export default class MigrationLoader {
    /**
     * Load migration files from specified directory paths or direct module map.
     * @param {string|string[]|Record<string, any>} paths Directory path(s) or explicit migration map
     * @returns {Promise<Array<{ name: string, file: string, path: string, instance: any }>>}
     */
    async load(paths) {
        if (!paths) return [];

        // If paths is a direct object map { name: MigrationClass/Object }
        if (typeof paths === "object" && !Array.isArray(paths) && !(paths instanceof String)) {
            const list = [];
            for (const [name, migrationDef] of Object.entries(paths)) {
                const instance = this.resolveInstance(migrationDef);
                list.push({ name, file: `${name}.js`, path: name, instance });
            }
            return list;
        }

        const dirPaths = Array.isArray(paths) ? paths : [paths];
        const allFiles = [];

        for (const dirPath of dirPaths) {
            if (!dirPath || typeof dirPath !== "string") continue;
            if (!fs.existsSync(dirPath)) continue;

            const files = await fs.promises.readdir(dirPath);
            for (const file of files) {
                if (file.endsWith(".js") || file.endsWith(".mjs")) {
                    const fullPath = path.resolve(dirPath, file);
                    const name = file.replace(/\.(js|mjs)$/, "");
                    allFiles.push({ name, file, path: fullPath });
                }
            }
        }

        // Sort chronologically by filename (timestamp prefix)
        allFiles.sort((a, b) => a.name.localeCompare(b.name));

        const loaded = [];
        for (const item of allFiles) {
            const fileUrl = pathToFileURL(item.path).href;
            const module = await import(fileUrl);
            const migrationExport = module.default || module;
            const instance = this.resolveInstance(migrationExport);

            loaded.push({
                name: item.name,
                file: item.file,
                path: item.path,
                instance
            });
        }

        return loaded;
    }

    resolveInstance(migrationExport) {
        if (typeof migrationExport === "function") {
            try {
                return new migrationExport();
            } catch {
                return migrationExport();
            }
        }
        return migrationExport;
    }
}
