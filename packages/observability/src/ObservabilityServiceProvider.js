import { ServiceProvider } from '@ecfjs/core';
import { ObservabilityManager } from './ObservabilityManager.js';
import { ConsoleExporter, MemoryExporter, NullExporter } from './exporters/Exporters.js';

export class ObservabilityServiceProvider extends ServiceProvider {
  register(app) {
    app.singleton('observability', (app) => {
      const config = app.has('config') ? app.make('config') : null;
      const exporterType = config?.get('observability.exporter', 'memory') ?? 'memory';
      const capacity = config?.get('observability.capacity', 500) ?? 500;

      const manager = new ObservabilityManager({ defaultExporter: false });

      if (exporterType === 'console') {
        manager.addExporter(new ConsoleExporter());
      } else if (exporterType === 'null') {
        manager.addExporter(new NullExporter());
      } else {
        manager.addExporter(new MemoryExporter({ capacity }));
      }

      return manager;
    });

    app.singleton('tracer', (app) => app.make('observability').tracer);
    app.singleton('metrics', (app) => app.make('observability').metrics);
    app.singleton('timeline', (app) => app.make('observability').timeline);
  }

  boot(app) {
    // Service provider boot hook for custom event listener setup if needed
  }
}

export default ObservabilityServiceProvider;
