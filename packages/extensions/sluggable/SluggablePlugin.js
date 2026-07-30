import Plugin from "../../database/src/orm/extensions/Plugin.js";

export default class SluggablePlugin extends Plugin {
    constructor(options = {}) {
        super({
            id: "sluggable",
            name: "@ecf/sluggable",
            version: "1.0.0",
            apiVersion: "1",
            framework: "^1.0.0",
            author: "ECF",
            keywords: ["orm", "slug", "sluggable", "ecf"],
            provides: {
                sluggable: "1.0.0"
            }
        });
        this.options = {
            source: options.source || "title",
            target: options.target || "slug",
            separator: options.separator || "-",
            unique: options.unique !== false,
            immutable: Boolean(options.immutable),
            ...options
        };
    }

    slugify(text, separator = "-") {
        if (!text) return "";
        return String(text)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove accents
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "") // Remove invalid chars
            .replace(/[\s_-]+/g, separator) // Collapse whitespace & dash
            .replace(new RegExp(`^${separator}+|${separator}+$`, "g"), ""); // Trim leading/trailing dash
    }

    async boot(ctx) {
        const modelClass = ctx.model;
        const { source, target, separator, unique, immutable } = this.options;

        ctx.events.on(modelClass, "saving", async (eventCtx) => {
            const model = eventCtx.model;
            const currentSlug = model.getAttribute(target);

            // Skip if immutable and slug is already set
            if (immutable && currentSlug) {
                return;
            }

            const sourceText = model.getAttribute(source);
            if (!sourceText) return;

            let baseSlug = this.slugify(sourceText, separator);
            if (!baseSlug) baseSlug = "n-a";

            if (!unique) {
                model.setAttribute(target, baseSlug);
                return;
            }

            // Handle Unique Collision Resolution
            const pk = modelClass.repository().getPrimaryKey();
            const currentId = model.getAttribute(pk);

            // Query existing matching slugs starting with baseSlug
            const query = modelClass.withTrashed
                ? modelClass.withTrashed()
                : modelClass.query();

            let matchingQuery = query.where(target, "like", `${baseSlug}%`);
            if (currentId) {
                matchingQuery = matchingQuery.where(pk, "!=", currentId);
            }

            const existingRecords = await matchingQuery.get();
            if (existingRecords.length === 0) {
                model.setAttribute(target, baseSlug);
                return;
            }

            const existingSlugs = new Set(existingRecords.map(r => r.getAttribute(target)));
            if (!existingSlugs.has(baseSlug)) {
                model.setAttribute(target, baseSlug);
                return;
            }

            // Find next available counter suffix
            let counter = 1;
            let candidate = `${baseSlug}${separator}${counter}`;
            while (existingSlugs.has(candidate)) {
                counter += 1;
                candidate = `${baseSlug}${separator}${counter}`;
            }

            model.setAttribute(target, candidate);
        });
    }
}
