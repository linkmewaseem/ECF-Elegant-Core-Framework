import fs from "node:fs/promises";
import path from "node:path";
import generateId from "../utils/generateId.js";
import ViewError from "../errors/ViewError.js";

export default class ViewLoader {
    async load(filePath) {
        this.validatePath(filePath);

        try {
            const [source, stats] = await Promise.all([
                fs.readFile(filePath, "utf-8"),
                fs.stat(filePath)
            ]);

            return {
                id: generateId(filePath),
                path: filePath,
                extension: path.extname(filePath),
                source,
                lastModified: stats.mtimeMs
            };
        } catch (error) {
            throw new ViewError(`Failed to load view at "${filePath}": ${error.message}`);
        }
    }

    async exists(filePath) {
        this.validatePath(filePath);
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    validatePath(filePath) {
        if (typeof filePath !== "string" || filePath.trim() === "") {
            throw new ViewError("ViewLoader requires a non-empty file path.");
        }
    }
}
