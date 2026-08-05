import { ASTInjector } from '../ast/ASTInjector.js';

export class PackageRegistry {
  static PACKAGES = {
    auth: { name: '@ecfjs/auth', provider: 'AuthServiceProvider', env: { AUTH_GUARD: 'web' } },
    api: { name: '@ecfjs/api', provider: 'ApiServiceProvider', env: { API_PREFIX: '/api' } },
    queue: { name: '@ecfjs/queue', provider: 'QueueServiceProvider', env: { QUEUE_CONNECTION: 'memory' } },
    search: { name: '@ecfjs/search', provider: 'SearchServiceProvider', env: { SEARCH_DRIVER: 'memory' } },
    logging: { name: '@ecfjs/logging', provider: 'LoggingServiceProvider', env: { LOG_CHANNEL: 'stack' } },
    broadcast: { name: '@ecfjs/broadcast', provider: 'BroadcastServiceProvider', env: { BROADCAST_DRIVER: 'memory' } },
    media: { name: '@ecfjs/media', provider: 'MediaServiceProvider', env: { MEDIA_DISK: 'local' } },
    observability: { name: '@ecfjs/observability', provider: 'ObservabilityServiceProvider', env: { OBSERVABILITY_EXPORTER: 'memory' } },
    devtools: { name: '@ecfjs/devtools', provider: 'DevToolsServiceProvider', env: { DEVTOOLS_ENABLED: 'true' } },
    testing: { name: '@ecfjs/testing', provider: 'TestingServiceProvider', env: {} },
  };

  static get(packageName) {
    return PackageRegistry.PACKAGES[packageName.toLowerCase()] || null;
  }
}

/**
 * Automated Package Installer (ecf install [package]).
 */
export class PackageInstaller {
  constructor() {
    this.astInjector = new ASTInjector();
  }

  async install(packageName, options = {}) {
    const pkgInfo = PackageRegistry.get(packageName);
    if (!pkgInfo) {
      throw new Error(`Package "${packageName}" is not a registered ECF official package.`);
    }

    // Mock installation process
    return {
      success: true,
      package: pkgInfo.name,
      provider: pkgInfo.provider,
      env: pkgInfo.env,
    };
  }
}

export default PackageInstaller;
