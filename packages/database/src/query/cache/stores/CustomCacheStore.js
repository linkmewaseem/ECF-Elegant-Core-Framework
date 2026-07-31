import ICacheStore from "../../../contracts/ICacheStore.js";

export default class CustomCacheStore extends ICacheStore {
    #customHandler;

    constructor(customHandler = {}) {
        super();
        this.#customHandler = customHandler;
    }

    get(key) {
        return typeof this.#customHandler.get === "function" ? this.#customHandler.get(key) : null;
    }

    set(key, value, ttlSeconds = null, tags = []) {
        if (typeof this.#customHandler.set === "function") {
            this.#customHandler.set(key, value, ttlSeconds, tags);
        }
    }

    forget(key) {
        if (typeof this.#customHandler.forget === "function") {
            this.#customHandler.forget(key);
        }
    }

    flush() {
        if (typeof this.#customHandler.flush === "function") {
            this.#customHandler.flush();
        }
    }

    flushTags(tags) {
        if (typeof this.#customHandler.flushTags === "function") {
            this.#customHandler.flushTags(tags);
        }
    }

    tag(tags) {
        return {
            set: (key, value, ttlSeconds = null) => this.set(key, value, ttlSeconds, tags),
            get: (key) => this.get(key),
            forget: (key) => this.forget(key),
            flush: () => this.flushTags(tags)
        };
    }
}
