export default class Facade {
    static app = null;

    /**
     * Set the application instance.
     */
    static setApplication(app) {
        this.app = app;
    }

    /**
     * Every child facade must define its container binding.
     * Example: "config", "database", "logger"
     */
    static accessor() {
        throw new Error("Facade must implement accessor().");
    }

    /**
     * Resolve the real object from the container.
     */
    static getRoot() {
        return this.app.make(this.accessor());
    }

    /**
     * Create a Proxy around a facade class.
     */
    static create(FacadeClass) {
        return new Proxy(FacadeClass, {
            get(target, prop, receiver) {

                // If the property exists directly on the subclass (not inherited from Facade base class),
                // return it normally.
                if (Object.prototype.hasOwnProperty.call(target, prop) || prop === "accessor" || prop === "getRoot" || prop === "setApplication") {
                    return Reflect.get(target, prop, receiver);
                }

                // Otherwise resolve the real instance.
                const instance = target.getRoot();

                const value = Reflect.get(instance, prop);

                // If it's a function, bind it to the instance.
                if (typeof value === "function") {
                    return value.bind(instance);
                }

                return value;
            }
        });
    }
}