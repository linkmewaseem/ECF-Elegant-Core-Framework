export default class ValidationErrorBag {
    constructor(initialErrors = {}) {
        this.errors = new Map();
        if (initialErrors && typeof initialErrors === "object") {
            for (const [field, messages] of Object.entries(initialErrors)) {
                const list = Array.isArray(messages) ? messages : [messages];
                this.errors.set(field, [...list]);
            }
        }
    }

    add(field, message) {
        if (typeof field !== "string" || !field.trim()) return this;
        const normalizedField = field.trim();
        const msg = String(message);

        if (!this.errors.has(normalizedField)) {
            this.errors.set(normalizedField, []);
        }
        this.errors.get(normalizedField).push(msg);
        return this;
    }

    get(field) {
        return this.errors.get(field) ? [...this.errors.get(field)] : [];
    }

    first(field = null) {
        if (field !== null) {
            const list = this.errors.get(field);
            return list && list.length > 0 ? list[0] : null;
        }
        for (const list of this.errors.values()) {
            if (list.length > 0) return list[0];
        }
        return null;
    }

    has(field) {
        const list = this.errors.get(field);
        return list !== undefined && list.length > 0;
    }

    hasAny() {
        return this.errors.size > 0;
    }

    isEmpty() {
        return this.errors.size === 0;
    }

    count() {
        let total = 0;
        for (const list of this.errors.values()) {
            total += list.length;
        }
        return total;
    }

    all() {
        const result = {};
        for (const [field, list] of this.errors.entries()) {
            result[field] = [...list];
        }
        return result;
    }

    flat() {
        const result = [];
        for (const list of this.errors.values()) {
            result.push(...list);
        }
        return result;
    }
}
