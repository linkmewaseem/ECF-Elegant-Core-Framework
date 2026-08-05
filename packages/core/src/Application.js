import Container from "./Container.js";
import ContainerError from "./errors/ContainerError.js";
import ServiceProvider from "./ServiceProvider.js";
import ConfigManager from "./ConfigManager.js";

export default class Application {
    constructor() {
        this.container = new Container();
        this.providers = new Set();
        this.listenHandler = null;
    }

    // ---- Container delegation ----
    bind(...args) {
        return this.container.bind(...args);
    }

    singleton(...args) {
        return this.container.singleton(...args);
    }

    make(...args) {
        return this.container.make(...args);
    }

    has(...args) {
        return this.container.has(...args);
    }

    forget(...args) {
        return this.container.forget(...args);
    }

    flush(...args) {
        return this.container.flush(...args);
    }
    // ---- Provider handling ----
    register(ProviderClass) {
        this.validateProvider(ProviderClass);

        if (this.providers.has(ProviderClass)) {
            return this;
        }

        this.providers.add(ProviderClass);
        return this;
    }

    use(middleware) {
        const registry = this.make("middleware.registry");
        registry.global(middleware);
        return this;
    }

    listen(...args) {
        this.assertListenHandlerRegistered();
        this.listenHandler(this, args);
        return this;
    }

    registerListenHandler(handler) {
        if (typeof handler !== "function") {
            throw new ContainerError("Listen handler must be a function.");
        }
        this.listenHandler = handler;
        return this;
    }

    assertListenHandlerRegistered() {
        if (typeof this.listenHandler !== "function") {
            throw new ContainerError(
                'Application.listen() has no listen handler registered. ' +
                'Register a provider (e.g. HttpServiceProvider from "@ecfjs/http") before calling listen().'
            );
        }
    }

    configure(configMap) {
        if (!this.has("config")) {
            this.singleton("config", () => new ConfigManager());
        }
        const configManager = this.make("config");
        configManager.loadMany(configMap);
        return this;
    }

    async handle(rawRequest, rawResponse) {
        const kernel = this.make("http.kernel");
        return await kernel.handle(rawRequest, rawResponse);
    }

    boot() {
        for (const ProviderClass of this.providers) {
            const provider = new ProviderClass();
            provider.register(this);
            provider.boot(this);
        }
        return this;
    }

    validateProvider(ProviderClass) {
        if (typeof ProviderClass !== "function") {
            throw new ContainerError("Service provider must be a class.");
        }

        if (!(ProviderClass.prototype instanceof ServiceProvider)) {
            throw new ContainerError(
                `Service provider "${ProviderClass.name}" must extend ServiceProvider.`
            );
        }
    }
}