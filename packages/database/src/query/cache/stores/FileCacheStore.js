import ICacheStore from "../../../contracts/ICacheStore.js";
import MemoryCacheStore from "./MemoryCacheStore.js";

export default class FileCacheStore extends ICacheStore {
    #underlyingStore;

    constructor(storageDir = null) {
        super();
        this.#underlyingStore = new MemoryCacheStore();
    }

    get(key) {
        return this.#underlyingStore.get(key);
    }

    set(key, value, ttlSeconds = null, tags = []) {
        this.#underlyingStore.set(key, value, ttlSeconds, tags);
    }

    forget(key) {
        this.#underlyingStore.forget(key);
    }

    flush() {
        this.#underlyingStore.flush();
    }

    flushTags(tags) {
        this.#underlyingStore.flushTags(tags);
    }

    tag(tags) {
        return this.#underlyingStore.tag(tags);
    }
}
