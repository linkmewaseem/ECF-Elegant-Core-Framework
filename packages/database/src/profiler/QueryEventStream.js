export default class QueryEventStream {
    #listeners = new Set();
    #enabled = true;

    enable() { this.#enabled = true; }
    disable() { this.#enabled = false; }
    isEnabled() { return this.#enabled; }

    subscribe(listener) {
        if (typeof listener === "function") {
            this.#listeners.add(listener);
        }
        return () => this.#listeners.delete(listener);
    }

    emit(stage, payload) {
        if (!this.#enabled || this.#listeners.size === 0) return;

        const event = {
            stage, // 'Query Started' | 'Compiled' | 'Executing' | 'Executed' | 'Hydrated'
            timestamp: Date.now(),
            ...payload
        };

        for (const listener of this.#listeners) {
            try {
                listener(event);
            } catch (err) {
                // Prevent listener errors from breaking core query execution
            }
        }
    }
}
