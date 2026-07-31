export default class RelationCache {
    #cache = new Map();

    get(relationName) {
        return this.#cache.has(relationName) ? this.#cache.get(relationName) : null;
    }

    set(relationName, value) {
        this.#cache.set(relationName, value);
        return this;
    }

    has(relationName) {
        return this.#cache.has(relationName);
    }

    forget(relationName) {
        this.#cache.delete(relationName);
        return this;
    }

    clear() {
        this.#cache.clear();
        return this;
    }

    get size() {
        return this.#cache.size;
    }
}
