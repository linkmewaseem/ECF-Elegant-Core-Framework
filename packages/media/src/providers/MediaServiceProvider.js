import { ServiceProvider } from '@ecfjs/core';
import { MediaManager } from '../internal/MediaManager.js';
import { MediaFacade } from '../facades/MediaFacade.js';
import { BuiltInProfiles } from '../profiles/MediaProfile.js';

export class MediaServiceProvider extends ServiceProvider {
  register(app = this.app) {
    const container = app || this.app;
    if (!container) return;
    container.singleton("media", (c) => {
      const manager = new MediaManager();

      if (c.has("storage")) {
        manager.setStorage(c.make("storage"));
      }
      if (c.has("queue")) {
        manager.setQueue(c.make("queue"));
      }
      if (c.has("events")) {
        manager.setEvents(c.make("events"));
      }

      return manager;
    });
  }

  boot(app = this.app) {
    const container = app || this.app;
    if (!container) return;
    const manager = container.make("media");
    MediaFacade.bind(manager);
  }
}

export default MediaServiceProvider;
