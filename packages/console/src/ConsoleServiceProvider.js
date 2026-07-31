import { ServiceProvider } from "@ecf/core";
import ConsoleKernel from "./ConsoleKernel.js";

export class ConsoleServiceProvider extends ServiceProvider {
  register(app) {
    app.singleton("console.kernel", () => new ConsoleKernel(app));
  }

  boot(app) {
    // Pre-wire console kernel
  }
}

export default ConsoleServiceProvider;
