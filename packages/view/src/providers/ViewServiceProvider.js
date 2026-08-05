import { ServiceProvider } from "@ecfjs/core";
import path from "node:path";
import ViewManager from "../manager/ViewManager.js";
import ViewLoader from "../loader/ViewLoader.js";
import Compiler from "../Compiler.js";
import Renderer from "../renderer/Renderer.js";

export default class ViewServiceProvider extends ServiceProvider {
    register(app) {
        app.singleton("view", (app) => {
            const loader = new ViewLoader();
            const compiler = new Compiler();
            const renderer = new Renderer();

            // Use ConfigManager if registered, otherwise fall back to safe defaults.
            const config = app.has("config") ? app.make("config") : null;
            const basePath = config?.get("view.path") ?? path.join(process.cwd(), "views");
            const extension = config?.get("view.extension") ?? ".ecf";
            const cache = config?.get("view.cache") ?? true;

            return new ViewManager(loader, compiler, renderer, { basePath, extension, cache });
        });
    }
}
