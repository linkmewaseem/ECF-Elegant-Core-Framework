import fs from "node:fs";
import path from "node:path";

export default class MigrationCreator {
    #customDir;

    constructor(customDir = null) {
        this.#customDir = customDir;
    }

    /**
     * Create a new migration file on disk.
     * @param {string} name Migration name (e.g. 'create_users_table')
     * @param {string|null} targetDir Target directory
     * @param {{ table?: string, create?: boolean }} options
     */
    async create(name, targetDir = null, options = {}) {
        const timestamp = this.getTimestamp();
        const snakeName = this.toSnakeCase(name);
        const fileName = `${timestamp}_${snakeName}.js`;

        const dir = targetDir || this.#customDir || path.join(process.cwd(), "database", "migrations");
        await fs.promises.mkdir(dir, { recursive: true });

        const filePath = path.join(dir, fileName);
        const className = this.toPascalCase(snakeName);
        const stub = this.getStub(className, options.table || this.guessTable(snakeName), options.create ?? snakeName.startsWith("create_"));

        await fs.promises.writeFile(filePath, stub, "utf-8");

        return { fileName, filePath, className };
    }

    getTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const mins = String(now.getMinutes()).padStart(2, "0");
        const secs = String(now.getSeconds()).padStart(2, "0");

        return `${year}_${month}_${day}_${hours}${mins}${secs}`;
    }

    toSnakeCase(str) {
        return str
            .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
            .replace(/[^a-zA-Z0-9_]/g, "_")
            .toLowerCase();
    }

    toPascalCase(str) {
        return str
            .split("_")
            .filter(Boolean)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join("");
    }

    guessTable(snakeName) {
        const match = snakeName.match(/^create_(.+)_table$/);
        return match ? match[1] : null;
    }

    getStub(className, table = null, isCreate = true) {
        if (table && isCreate) {
            return `import { Migration } from "@ecfjs/database";

export default class ${className} extends Migration {
    async up(schema) {
        await schema.create("${table}", (table) => {
            table.id();
            table.timestamps();
        });
    }

    async down(schema) {
        await schema.dropIfExists("${table}");
    }
}
`;
        }

        if (table && !isCreate) {
            return `import { Migration } from "@ecfjs/database";

export default class ${className} extends Migration {
    async up(schema) {
        await schema.table("${table}", (table) => {
            // Add or modify columns
        });
    }

    async down(schema) {
        await schema.table("${table}", (table) => {
            // Reverse column modifications
        });
    }
}
`;
        }

        return `import { Migration } from "@ecfjs/database";

export default class ${className} extends Migration {
    async up(schema) {
        // Run migration logic
    }

    async down(schema) {
        // Reverse migration logic
    }
}
`;
    }
}
