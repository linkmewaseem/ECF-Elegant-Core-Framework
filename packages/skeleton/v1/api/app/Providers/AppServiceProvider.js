import { ServiceProvider } from "@ecfjs/core";

export class AppServiceProvider extends ServiceProvider {
    register(app) {
        // Register your own bindings here.
    }

    boot(app) {
        // Boot your own services here — all framework providers are
        // already registered by this point, so app.make(...) is safe.
    }
}

export default AppServiceProvider;
