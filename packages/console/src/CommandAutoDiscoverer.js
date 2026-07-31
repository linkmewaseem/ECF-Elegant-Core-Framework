import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export class CommandAutoDiscoverer {
  static async discover(directoryPath, registry) {
    if (!directoryPath || !fs.existsSync(directoryPath)) {
      return;
    }

    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
      if (file.endsWith("Command.js") || file.endsWith("Command.ts")) {
        const fullPath = path.join(directoryPath, file);
        try {
          const moduleUrl = pathToFileURL(fullPath).href;
          const exported = await import(moduleUrl);
          const CommandClass = exported.default || Object.values(exported)[0];

          if (typeof CommandClass === "function") {
            registry.register(CommandClass);
          }
        } catch (err) {
          // Log or swallow individual discovery errors
        }
      }
    }
  }
}

export default CommandAutoDiscoverer;
