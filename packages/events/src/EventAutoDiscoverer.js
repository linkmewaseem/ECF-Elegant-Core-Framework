import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export class EventAutoDiscoverer {
  static async discover(listenersDir, dispatcher) {
    if (!listenersDir || !fs.existsSync(listenersDir)) return;

    const files = fs.readdirSync(listenersDir);

    for (const file of files) {
      if (file.endsWith("Listener.js") || file.endsWith("Subscriber.js")) {
        const fullPath = path.join(listenersDir, file);
        try {
          const moduleUrl = pathToFileURL(fullPath).href;
          const exported = await import(moduleUrl);
          const ClassRef = exported.default || Object.values(exported)[0];

          if (typeof ClassRef === "function") {
            const instance = new ClassRef();
            if (typeof instance.subscribe === "function") {
              instance.subscribe(dispatcher);
            }
          }
        } catch (err) {}
      }
    }
  }

  static cacheManifest(eventsMap, cachePath) {
    const dir = path.dirname(cachePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(eventsMap, null, 2), "utf8");
  }

  static loadManifest(cachePath) {
    if (!fs.existsSync(cachePath)) return null;
    return JSON.parse(fs.readFileSync(cachePath, "utf8"));
  }
}

export default EventAutoDiscoverer;
