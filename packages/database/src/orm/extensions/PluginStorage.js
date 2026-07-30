export default class PluginStorage {
    #store = new Map();

    get(key, defaultValue = undefined) {
        return this.#store.has(key) ? this.#store.get(key) : defaultValue;
    }

    set(key, value) {
        this.#store.set(key, value);
        return this;
    }

    has(key) {
        return this.#store.has(key);
    }

    delete(key) {
        return this.#store.delete(key);
    }

    clear() {
        this.#store.clear();
    }

    entries() {
        return Array.from(this.#store.entries());
    }
}
