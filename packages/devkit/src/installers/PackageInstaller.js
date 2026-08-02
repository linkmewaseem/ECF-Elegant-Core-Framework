import { ASTInjector } from '../ast/ASTInjector.js';

export class PackageRegistry {
  static PACKAGES = {
    auth: { name: '@ecf/auth', provider: 'AuthServiceProvider', env: { AUTH_GUARD: 'web' } },
    api: { name: '@ecf/api', provider: 'ApiServiceProvider', env: { API_PREFIX: '/api' } },
    queue: { name: '@ecf/queue', provider: 'QueueServiceProvider', env: { QUEUE_CONNECTION: 'memory' } },
    search: { name: '@ecf/search', provider: 'SearchServiceProvider', env: { SEARCH_DRIVER: 'memory' } },
    logging: { name: '@ecf/logging', provider: 'LoggingServiceProvider', env: { LOG_CHANNEL: 'stack' } },
    broadcast: { name: '@ecf/broadcast', provider: 'BroadcastServiceProvider', env: { BROADCAST_DRIVER: 'memory' } },
    media: { name: '@ecf/media', provider: 'MediaServiceProvider', env: { MEDIA_DISK: 'local' } },
    observability: { name: '@ecf/observability', provider: 'ObservabilityServiceProvider', env: { OBSERVABILITY_EXPORTER: 'memory' } },
    devtools: { name: '@ecf/devtools', provider: 'DevToolsServiceProvider', env: { DEVTOOLS_ENABLED: 'true' } },
    testing: { name: '@ecf/testing', provider: 'TestingServiceProvider', env: {} },
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
