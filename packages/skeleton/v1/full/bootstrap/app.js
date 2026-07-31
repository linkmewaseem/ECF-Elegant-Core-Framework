import { Application, Container } from '../../../../core/src/index.js';
import { Router } from '../../../../http/src/index.js';
import registerWebRoutes from '../routes/web.js';
import registerApiRoutes from '../routes/api.js';
import registerHealthRoutes from '../routes/health.js';
import providers from './providers.js';

/**
 * Creates and initializes the ECF Full-Stack Application instance.
 */
export function createApp() {
  const container = new Container();
  const app = new Application({ container });

  const router = new Router();
  registerWebRoutes(router);
  registerApiRoutes(router);
  registerHealthRoutes(router);

  container.singleton('router', () => router);
  container.singleton('app', () => app);

  for (const ProviderClass of providers) {
    const provider = new ProviderClass(app);
    if (typeof provider.register === 'function') provider.register();
    if (typeof provider.boot === 'function') provider.boot();
  }

  return { app, container, router };
}

export default createApp;
