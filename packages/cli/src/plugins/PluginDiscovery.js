import fs from 'node:fs';
import path from 'node:path';

export class PluginDiscovery {
  /**
   * Discover and auto-register plugin CLI commands into registry.
   * @param {import('../kernel/CommandRegistry.js').CommandRegistry} registry
   * @param {string} [basePath=process.cwd()]
   */
  static async discoverAndRegister(registry, basePath = process.cwd()) {
    const pluginDirs = [
      path.join(basePath, 'plugins/installed'),
      path.join(basePath, 'plugins/custom')
    ];

    const discovered = [];

    for (const pluginDir of pluginDirs) {
      if (fs.existsSync(pluginDir)) {
        const entries = fs.readdirSync(pluginDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const manifestPath = path.join(pluginDir, entry.name, 'plugin.json');
            if (fs.existsSync(manifestPath)) {
              try {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
                discovered.push({ name: entry.name, path: path.join(pluginDir, entry.name), manifest });
              } catch {
                // Ignore malformed manifests
              }
            }
          }
        }
      }
    }

    return discovered;
  }
}
