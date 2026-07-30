export default class ModelCollection extends Array {
    constructor(...args) {
        if (args.length === 1 && Array.isArray(args[0])) {
            super(args[0].length);
            for (let i = 0; i < args[0].length; i++) {
                this[i] = args[0][i];
            }
        } else if (args.length === 1 && typeof args[0] === "number") {
            super(args[0]);
        } else {
            super(args.length);
            for (let i = 0; i < args.length; i++) {
                this[i] = args[i];
            }
        }
    }

    static make(items = []) {
        return new ModelCollection(Array.isArray(items) ? items : [items]);
    }

    find(predicate) {
        if (typeof predicate === "function") {
            return super.find(predicate) || null;
        }
        for (let i = 0; i < this.length; i++) {
            const item = this[i];
            if (item && typeof item.getAttribute === "function") {
                const pk = item.constructor?.primaryKey || "id";
                if (item.getAttribute(pk) == predicate) {
                    return item;
                }
            }
        }
        return null;
    }

    first(predicate = null) {
        if (!predicate) {
            return this[0] || null;
        }
        for (let i = 0; i < this.length; i++) {
            if (predicate(this[i], i)) {
                return this[i];
            }
        }
        return null;
    }

    last(predicate = null) {
        if (!predicate) {
            return this[this.length - 1] || null;
        }
        for (let i = this.length - 1; i >= 0; i--) {
            if (predicate(this[i], i)) {
                return this[i];
            }
        }
        return null;
    }

    pluck(key) {
        const result = [];
        for (let i = 0; i < this.length; i++) {
            const item = this[i];
            if (item && typeof item.getAttribute === "function") {
                result.push(item.getAttribute(key));
            } else if (item && typeof item === "object" && key in item) {
                result.push(item[key]);
            } else {
                result.push(null);
            }
        }
        return result;
    }

    keyBy(key) {
        const result = {};
        for (let i = 0; i < this.length; i++) {
            const item = this[i];
            let val = null;
            if (item && typeof item.getAttribute === "function") {
                val = item.getAttribute(key);
            } else if (item && typeof item === "object" && key in item) {
                val = item[key];
            }
            if (val !== null && val !== undefined) {
                result[val] = item;
            }
        }
        return result;
    }

    groupBy(key) {
        const result = {};
        for (let i = 0; i < this.length; i++) {
            const item = this[i];
            let val = null;
            if (typeof key === "function") {
                val = key(item, i);
            } else if (item && typeof item.getAttribute === "function") {
                val = item.getAttribute(key);
            } else if (item && typeof item === "object" && key in item) {
                val = item[key];
            }

            const k = String(val);
            if (!result[k]) {
                result[k] = new ModelCollection();
            }
            result[k].push(item);
        }
        return result;
    }

    where(key, operator = null, value = undefined) {
        if (arguments.length === 2) {
            value = operator;
            operator = "=";
        }

        const filtered = this.filter(item => {
            let itemVal = null;
            if (item && typeof item.getAttribute === "function") {
                itemVal = item.getAttribute(key);
            } else if (item && typeof item === "object" && key in item) {
                itemVal = item[key];
            }

            switch (operator) {
                case "=":
                case "==":
                    return itemVal == value;
                case "===":
                    return itemVal === value;
                case "!=":
                case "<>":
                    return itemVal != value;
                case "!==":
                    return itemVal !== value;
                case ">":
                    return itemVal > value;
                case ">=":
                    return itemVal >= value;
                case "<":
                    return itemVal < value;
                case "<=":
                    return itemVal <= value;
                default:
                    return false;
            }
        });

        return new ModelCollection(filtered);
    }

    unique(key = null) {
        const seen = new Set();
        const result = [];

        for (let i = 0; i < this.length; i++) {
            const item = this[i];
            let val = item;
            if (key) {
                if (typeof key === "function") {
                    val = key(item, i);
                } else if (item && typeof item.getAttribute === "function") {
                    val = item.getAttribute(key);
                } else if (item && typeof item === "object" && key in item) {
                    val = item[key];
                }
            }

            if (!seen.has(val)) {
                seen.add(val);
                result.push(item);
            }
        }

        return new ModelCollection(result);
    }

    sortBy(key, descending = false) {
        const sorted = [...this].sort((a, b) => {
            let valA = a;
            let valB = b;

            if (typeof key === "function") {
                valA = key(a);
                valB = key(b);
            } else if (typeof key === "string") {
                valA = a && typeof a.getAttribute === "function" ? a.getAttribute(key) : a[key];
                valB = b && typeof b.getAttribute === "function" ? b.getAttribute(key) : b[key];
            }

            if (valA < valB) return descending ? 1 : -1;
            if (valA > valB) return descending ? -1 : 1;
            return 0;
        });

        return new ModelCollection(sorted);
    }

    chunk(size) {
        const chunks = [];
        for (let i = 0; i < this.length; i += size) {
            chunks.push(new ModelCollection(this.slice(i, i + size)));
        }
        return new ModelCollection(chunks);
    }

    partition(predicate) {
        const passed = new ModelCollection();
        const failed = new ModelCollection();

        for (let i = 0; i < this.length; i++) {
            if (predicate(this[i], i)) {
                passed.push(this[i]);
            } else {
                failed.push(this[i]);
            }
        }

        return [passed, failed];
    }

    sum(key = null) {
        let total = 0;
        for (let i = 0; i < this.length; i++) {
            const item = this[i];
            let val = item;
            if (key) {
                if (typeof key === "function") {
                    val = key(item, i);
                } else if (item && typeof item.getAttribute === "function") {
                    val = item.getAttribute(key);
                } else if (item && typeof item === "object" && key in item) {
                    val = item[key];
                }
            }
            total += Number(val) || 0;
        }
        return total;
    }

    avg(key = null) {
        if (this.length === 0) return 0;
        return this.sum(key) / this.length;
    }

    tap(callback) {
        callback(this);
        return this;
    }

    pipe(callback) {
        return callback(this);
    }

    when(value, callback, defaultCallback = null) {
        const isTruthy = typeof value === "function" ? value(this) : value;
        if (isTruthy) {
            return callback(this, value) || this;
        } else if (defaultCallback) {
            return defaultCallback(this, value) || this;
        }
        return this;
    }

    unless(value, callback, defaultCallback = null) {
        const isTruthy = typeof value === "function" ? value(this) : value;
        return this.when(!isTruthy, callback, defaultCallback);
    }

    async load(...relations) {
        const RelationLoader = (await import("./loader/RelationLoader.js")).default;
        await RelationLoader.load(this, relations);
        return this;
    }

    async loadCount(...relations) {
        const AggregateLoader = (await import("./loader/AggregateLoader.js")).default;
        for (const rel of relations.flat()) {
            await AggregateLoader.loadCount(this, rel);
        }
        return this;
    }

    async loadExists(...relations) {
        const AggregateLoader = (await import("./loader/AggregateLoader.js")).default;
        for (const rel of relations.flat()) {
            await AggregateLoader.loadExists(this, rel);
        }
        return this;
    }

    toJSON() {
        return this.map(item => (item && typeof item.toJSON === "function" ? item.toJSON() : item)).toArray();
    }

    toArray() {
        return Array.from(this);
    }
}
