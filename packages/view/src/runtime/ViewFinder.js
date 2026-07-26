import path from "node:path";
import fs from "node:fs";
import ViewError from "../errors/ViewError.js";

export default class ViewFinder {
    constructor(paths = [], extension = ".ecf") {
        this.paths = Array.isArray(paths) ? [...paths] : [paths];
        this.extension = extension.startsWith(".") ? extension : `.${extension}`;
        this.namespaces = new Map();
    }

    addPath(dirPath) {
        if (typeof dirPath === "string" && dirPath.trim() !== "") {
            this.paths.push(dirPath);
        }
        return this;
    }

    addNamespace(namespace, dirPath) {
        if (typeof namespace === "string" && typeof dirPath === "string") {
            this.namespaces.set(namespace, dirPath);
        }
        return this;
    }

    find(name) {
        this.validateName(name);

        // Handle namespace view syntax: "namespace::view.name"
        if (name.includes("::")) {
            const [namespace, relativeName] = name.split("::");
            const baseDir = this.namespaces.get(namespace);
            if (!baseDir) {
                throw new ViewError(`No view namespace registered for "${namespace}".`);
            }
            const relativePath = this.nameToPath(relativeName);
            const fullPath = path.join(baseDir, relativePath);
            if (fs.existsSync(fullPath)) {
                return fullPath;
            }
            throw new ViewError(`View "${name}" not found at "${fullPath}".`);
        }

        // Standard view resolution across registered paths
        const relativePath = this.nameToPath(name);
        for (const baseDir of this.paths) {
            const fullPath = path.join(baseDir, relativePath);
            if (fs.existsSync(fullPath)) {
                return fullPath;
            }
        }

        throw new ViewError(`View "${name}" not found in paths: ${this.paths.join(", ")}`);
    }

    findFirst(names) {
        if (!Array.isArray(names)) {
            throw new ViewError("ViewFinder.findFirst() requires an array of view names.");
        }
        for (const name of names) {
            if (this.exists(name)) {
                return this.find(name);
            }
        }
        throw new ViewError(`None of the views [${names.join(", ")}] could be found.`);
    }

    exists(name) {
        try {
            this.find(name);
            return true;
        } catch {
            return false;
        }
    }

    nameToPath(name) {
        return name.split(".").join(path.sep) + this.extension;
    }

    validateName(name) {
        if (typeof name !== "string" || name.trim() === "") {
            throw new ViewError("ViewFinder requires a non-empty view name string.");
        }
    }
}
