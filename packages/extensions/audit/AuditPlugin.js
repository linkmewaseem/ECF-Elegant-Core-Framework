import Plugin from "../../database/src/orm/extensions/Plugin.js";

export default class AuditPlugin extends Plugin {
    #audits = [];

    constructor(options = {}) {
        super({
            id: "audit",
            name: "@ecf/audit",
            version: "1.0.0",
            apiVersion: "1",
            framework: "^1.0.0",
            author: "ECF",
            keywords: ["orm", "audit", "auditing", "history", "ecf"],
            provides: {
                auditing: "1.0.0"
            }
        });
        this.options = {
            handler: options.handler || null,
            userResolver: options.userResolver || (() => null),
            ipResolver: options.ipResolver || (() => "127.0.0.1"),
            requestIdResolver: options.requestIdResolver || (() => "req-1"),
            ...options
        };
    }

    getAudits() {
        return [...this.#audits];
    }

    clearAudits() {
        this.#audits = [];
    }

    async boot(ctx) {
        const modelClass = ctx.model;
        const { handler, userResolver, ipResolver, requestIdResolver } = this.options;

        const recordAudit = async (event, eventCtx) => {
            const model = eventCtx.model;
            const pk = modelClass.repository().getPrimaryKey();
            const id = model.getAttribute(pk);

            const auditPayload = {
                event,
                model: modelClass.name || "Model",
                primaryKey: id,
                old: eventCtx.original || {},
                new: eventCtx.changes || {},
                user: typeof userResolver === "function" ? userResolver() : null,
                ip: typeof ipResolver === "function" ? ipResolver() : "127.0.0.1",
                requestId: typeof requestIdResolver === "function" ? requestIdResolver() : "req-1",
                timestamp: new Date().toISOString()
            };

            this.#audits.push(auditPayload);
            ctx.storage.set("lastAudit", auditPayload);

            if (typeof handler === "function") {
                await handler(auditPayload, eventCtx);
            }
        };

        ctx.events.on(modelClass, "created", async (eventCtx) => {
            await recordAudit("created", eventCtx);
        });

        ctx.events.on(modelClass, "updated", async (eventCtx) => {
            await recordAudit("updated", eventCtx);
        });

        ctx.events.on(modelClass, "deleted", async (eventCtx) => {
            await recordAudit("deleted", eventCtx);
        });
    }
}
