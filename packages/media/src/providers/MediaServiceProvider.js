import { MediaManager } from '../internal/MediaManager.js';
import { MediaFacade } from '../facades/MediaFacade.js';
import { BuiltInProfiles } from '../profiles/MediaProfile.js';

/**
 * MediaServiceProvider — Registers @ecf/media into the ECF container.
 *
 * Boot sequence:
 *  1. Instantiate MediaManager
 *  2. Register built-in drivers (sharp, null)
 *  3. Register built-in profiles (product, avatar, hero, banner)
 *  4. Wire optional @ecf/storage, @ecf/queue, @ecf/events integrations
 *  5. Bind MediaFacade
 *  6. Register container alias: "media"
 */
export class MediaServiceProvider {
  #app;

  constructor(app) {
    this.#app = app;
  }

  register() {
    this.#app.singleton("media", () => {
      const manager = new MediaManager();

      // Wire @ecf/storage if available
      if (this.#app.has("storage")) {
        manager.setStorage(this.#app.make("storage"));
      }

      // Wire @ecf/queue if available
      if (this.#app.has("queue")) {
        manager.setQueue(this.#app.make("queue"));
      }

      // Wire @ecf/events if available
      if (this.#app.has("events")) {
        manager.setEvents(this.#app.make("events"));
      }

      return manager;
    });
  }

  boot() {
    const manager = this.#app.make("media");
    MediaFacade.bind(manager);
  }
}

export default MediaServiceProvider;
