import { EntryStore } from './EntryStore.js';
import { DevToolsServer } from '../server/DevToolsServer.js';
import { HttpCollector } from '../collectors/HttpCollector.js';
import { DatabaseCollector } from '../collectors/DatabaseCollector.js';
import { CacheCollector } from '../collectors/CacheCollector.js';
import { QueueCollector } from '../collectors/QueueCollector.js';
import { MailCollector } from '../collectors/MailCollector.js';
import { NotificationCollector } from '../collectors/NotificationCollector.js';
import { EventCollector } from '../collectors/EventCollector.js';
import { StorageCollector } from '../collectors/StorageCollector.js';
import { UploadCollector } from '../collectors/UploadCollector.js';
import { MediaCollector } from '../collectors/MediaCollector.js';
import { ExceptionCollector } from '../collectors/ExceptionCollector.js';
import { PerformanceCollector } from '../collectors/PerformanceCollector.js';
import { LogCollector } from '../collectors/LogCollector.js';

export class DevToolsManager {
  #store;
  #server;
  #collectors;

  constructor({ port = 8787, maxEntries = 200 } = {}) {
    this.#store = new EntryStore({ capacity: maxEntries });
    this.#server = new DevToolsServer(this.#store, { port });

    this.#collectors = {
      http: new HttpCollector(),
      db: new DatabaseCollector(),
      cache: new CacheCollector(),
      queue: new QueueCollector(),
      mail: new MailCollector(),
      notifications: new NotificationCollector(),
      events: new EventCollector(),
      storage: new StorageCollector(),
      upload: new UploadCollector(),
      media: new MediaCollector(),
      exceptions: new ExceptionCollector(),
      performance: new PerformanceCollector(),
      logs: new LogCollector(),
    };
  }


  startServer(port) {
    return this.#server.start(port);
  }

  stopServer() {
    return this.#server.stop();
  }

  getUrl() {
    return this.#server.getUrl();
  }

  record(requestRecord) {
    this.#store.add(requestRecord);
    return this;
  }

  getEntries() {
    return this.#store.all();
  }

  getEntry(id) {
    return this.#store.get(id);
  }

  clear() {
    this.#store.clear();
    return this;
  }

  get store() {
    return this.#store;
  }

  get server() {
    return this.#server;
  }

  get collectors() {
    return this.#collectors;
  }
}

export default DevToolsManager;
