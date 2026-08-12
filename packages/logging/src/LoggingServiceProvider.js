import { ServiceProvider } from '@ecfjs/core';
import { LogManager } from './LogManager.js';

/**
 * Service Provider for registering @ecfjs/logging in IoC container.
 */
export class LoggingServiceProvider extends ServiceProvider {
  register() {
    this.app.singleton('log', (container) => {
      const config = container.make('config')?.get('logging') || {};
      const eventEmitter = container.has('events') ? container.make('events') : null;
      const searchDriver = container.has('search') ? container.make('search') : null;

      return new LogManager({
        ...config,
        eventEmitter,
        searchDriver,
      });
    });

    this.app.alias('log', LogManager);
  }

  boot() {
    // Optional boot hook
  }
}

export default LoggingServiceProvider;
