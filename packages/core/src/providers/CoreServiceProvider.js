import ServiceProvider from "../ServiceProvider.js";
import ExceptionManager from "../ExceptionManager.js";
import EnvironmentServiceProvider from "./EnvironmentServiceProvider.js";
import ConfigServiceProvider from "./ConfigServiceProvider.js";

export default class CoreServiceProvider extends ServiceProvider {
    register(app) {
        app.singleton("exception.manager", () => {
            return new ExceptionManager();
        });

        const envProvider = new EnvironmentServiceProvider();
        envProvider.register(app);

        const configProvider = new ConfigServiceProvider();
        configProvider.register(app);
    }

    boot(app) {
        const configProvider = new ConfigServiceProvider();
        configProvider.boot(app);
    }
}
