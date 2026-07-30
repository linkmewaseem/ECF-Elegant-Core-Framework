import ModelCollection from "../ModelCollection.js";

export default class Relation {
    parent;
    related;
    builder;
    meta = {};
    relationName = null;

    constructor(parent, related) {
        this.parent = parent;
        this.related = related;
        this.builder = related.query();

        // Infer relation method name from stack trace
        try {
            const stack = new Error().stack;
            if (stack) {
                const lines = stack.split("\n");
                for (const line of lines) {
                    const match = line.match(/at\s+(?:[\w$]+\.)?([\w$]+)\s+\(/);
                    if (match && match[1]) {
                        const name = match[1];
                        if (!["constructor", "hasOne", "hasMany", "belongsTo", "belongsToMany", "getAttribute", "getResults"].includes(name)) {
                            this.relationName = name;
                            break;
                        }
                    }
                }
            }
        } catch (_) {}

        this.meta = {
            type: "relation",
            parentModel: parent?.constructor || null,
            relatedModel: related || null,
            foreignKey: null,
            localKey: null,
            pivotTable: null,
            foreignPivotKey: null,
            relatedPivotKey: null,
            inverse: false
        };
    }

    // QueryBuilder Method Proxying (Composition over Immutable Builder)

    where(column, operator, value, boolean = "and") {
        this.builder = this.builder.where(column, operator, value, boolean);
        return this;
    }

    orWhere(column, operator, value) {
        this.builder = this.builder.orWhere(column, operator, value);
        return this;
    }

    whereIn(column, values, boolean = "and", not = false) {
        this.builder = this.builder.whereIn(column, values, boolean, not);
        return this;
    }

    whereNotIn(column, values) {
        this.builder = this.builder.whereNotIn(column, values);
        return this;
    }

    whereNull(column, boolean = "and", not = false) {
        this.builder = this.builder.whereNull(column, boolean, not);
        return this;
    }

    whereNotNull(column) {
        this.builder = this.builder.whereNotNull(column);
        return this;
    }

    orderBy(column, direction = "asc") {
        this.builder = this.builder.orderBy(column, direction);
        return this;
    }

    latest(column = "created_at") {
        this.builder = this.builder.latest(column);
        return this;
    }

    oldest(column = "created_at") {
        this.builder = this.builder.oldest(column);
        return this;
    }

    limit(value) {
        this.builder = this.builder.limit(value);
        return this;
    }

    take(value) {
        return this.limit(value);
    }

    offset(value) {
        this.builder = this.builder.offset(value);
        return this;
    }

    skip(value) {
        return this.offset(value);
    }

    select(...columns) {
        this.builder = this.builder.select(...columns);
        return this;
    }

    join(table, first, operator, second) {
        this.builder = this.builder.join(table, first, operator, second);
        return this;
    }

    leftJoin(table, first, operator, second) {
        this.builder = this.builder.leftJoin(table, first, operator, second);
        return this;
    }

    rightJoin(table, first, operator, second) {
        this.builder = this.builder.rightJoin(table, first, operator, second);
        return this;
    }

    cache() {
        this.isCached = true;
        return this;
    }

    // Execution Methods

    async get() {
        const rows = await this.builder.get();
        const models = rows.map(r => this.related.repository().instantiateModel(r));
        return new ModelCollection(models);
    }

    async first() {
        const row = await this.builder.first();
        return row ? this.related.repository().instantiateModel(row) : null;
    }

    async count(column = "*") {
        return this.builder.count(column);
    }

    async exists() {
        return this.builder.exists();
    }

    async getResults() {
        return this.get();
    }

    // Native JS Promise Protocol (Thenable)
    then(onFulfilled, onRejected) {
        return this.getResults().then(res => {
            if (this.relationName && this.parent && typeof this.parent.getAttributeManager === "function") {
                this.parent.getAttributeManager().setRelation(this.relationName, res);
            }
            return res;
        }).then(onFulfilled, onRejected);
    }
}
