import crypto from "node:crypto";
import Plugin from "../../database/src/orm/extensions/Plugin.js";

export default class UuidsPlugin extends Plugin {
    constructor(options = {}) {
        super({
            id: "uuids",
            name: "@ecf/uuids",
            version: "1.0.0",
            apiVersion: "1",
            framework: "^1.0.0",
            author: "ECF",
            keywords: ["orm", "uuid", "uuidv7", "ecf"],
            provides: {
                uuids: "1.0.0"
            }
        });
        this.options = {
            column: options.column || "id",
            strategy: options.strategy || "v4",
            ...options
        };
    }

    generateUuid(strategy = "v4") {
        if (strategy === "v7") {
            // Time-ordered UUID v7 implementation
            const now = Date.now();
            const timeHex = now.toString(16).padStart(12, "0");
            const randomBytesHex = crypto.randomBytes(10).toString("hex");
            // 48-bit time | 4-bit ver (7) | 12-bit rand | 2-bit var (10) | 62-bit rand
            const varAndRand = (parseInt(randomBytesHex.slice(0, 4), 16) & 0x3fff | 0x8000).toString(16);
            return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-7${randomBytesHex.slice(4, 7)}-${varAndRand}-${randomBytesHex.slice(7, 19)}`;
        }
        return crypto.randomUUID();
    }

    async boot(ctx) {
        const modelClass = ctx.model;
        const col = this.options.column;
        const strategy = this.options.strategy;

        ctx.events.on(modelClass, "creating", async (eventCtx) => {
            const model = eventCtx.model;
            if (!model.getAttribute(col)) {
                model.setAttribute(col, this.generateUuid(strategy));
            }
        });
    }
}
