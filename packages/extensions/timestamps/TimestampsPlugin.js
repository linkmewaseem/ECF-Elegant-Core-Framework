import Plugin from "../../database/src/orm/extensions/Plugin.js";

export default class TimestampsPlugin extends Plugin {
    constructor(options = {}) {
        super({
            id: "timestamps",
            name: "@ecf/timestamps",
            version: "1.0.0",
            apiVersion: "1",
            framework: "^1.0.0",
            author: "ECF",
            keywords: ["orm", "timestamps", "ecf"],
            provides: {
                timestamps: "1.0.0"
            }
        });
        this.options = {
            created: options.created || "created_at",
            updated: options.updated || "updated_at",
            ...options
        };
    }

    async boot(ctx) {
        const modelClass = ctx.model;
        const createdCol = this.options.created;
        const updatedCol = this.options.updated;

        ctx.events.on(modelClass, "creating", async (eventCtx) => {
            const model = eventCtx.model;
            const now = new Date().toISOString();
            if (createdCol && !model.getAttribute(createdCol)) {
                model.setAttribute(createdCol, now);
            }
            if (updatedCol && !model.getAttribute(updatedCol)) {
                model.setAttribute(updatedCol, now);
            }
        });

        ctx.events.on(modelClass, "saving", async (eventCtx) => {
            const model = eventCtx.model;
            const now = new Date().toISOString();
            if (updatedCol) {
                model.setAttribute(updatedCol, now);
            }
        });
    }
}
