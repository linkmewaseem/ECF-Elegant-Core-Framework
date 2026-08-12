import fs from "node:fs";
import path from "node:path";

// Hydrate process.env from .env file if available
const envPath = path.resolve(process.cwd(), ".env");
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
            if (!process.env[key]) {
                process.env[key] = val;
            }
        }
    }
}

export default {
    default: process.env.DB_CONNECTION || "postgres",
    connections: {
        postgres: {
            driver: "postgres",
            host: process.env.DB_HOST || "127.0.0.1",
            port: Number(process.env.DB_PORT || 5432),
            database: process.env.DB_DATABASE || "ecf_app",
            username: process.env.DB_USERNAME || "postgres",
            password: process.env.DB_PASSWORD ?? "",
        },
        sqlite: {
            driver: "sqlite",
            database: process.env.DB_DATABASE || ":memory:",
            prefix: "",
        },
        mysql: {
            driver: "mysql",
            host: process.env.DB_HOST || "127.0.0.1",
            port: Number(process.env.DB_PORT || 3306),
            database: process.env.DB_DATABASE || "ecf_app",
            username: process.env.DB_USERNAME || "root",
            password: process.env.DB_PASSWORD ?? "",
        },
    },
};
