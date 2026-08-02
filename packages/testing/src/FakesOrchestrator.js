/**
 * Subsystem Fakes Orchestrator.
 * Wraps and delegates directly to existing package fakes (Queue, Mail, Events, Broadcast, Search, Storage, Logging, Notifications, Api).
 * Ensures a single source of truth across ECF ecosystem.
 */
export class FakesOrchestrator {
  constructor(app = null) {
    this.app = app;
    this.activeFakes = new Map();
  }

  /**
   * Orchestrate fakes across all registered ECF subsystems.
   */
  all() {
    this.mail();
    this.queue();
    this.events();
    this.broadcast();
    this.search();
    this.storage();
    this.logging();
    this.notifications();
    this.api();
    return this;
  }

  mail() {
    if (globalThis.__ECF_MAIL__) {
      const fake = globalThis.__ECF_MAIL__.fake();
      this.activeFakes.set('mail', fake);
      return fake;
    }
    return null;
  }

  queue() {
    if (globalThis.__ECF_QUEUE__) {
      const fake = globalThis.__ECF_QUEUE__.fake();
      this.activeFakes.set('queue', fake);
      return fake;
    }
    return null;
  }

  events() {
    if (globalThis.__ECF_EVENTS__) {
      const fake = globalThis.__ECF_EVENTS__.fake();
      this.activeFakes.set('events', fake);
      return fake;
    }
    return null;
  }

  broadcast() {
    if (globalThis.__ECF_BROADCAST__) {
      const fake = globalThis.__ECF_BROADCAST__.fake();
      this.activeFakes.set('broadcast', fake);
      return fake;
    }
    return null;
  }

  search() {
    if (globalThis.__ECF_SEARCH__) {
      const fake = globalThis.__ECF_SEARCH__.fake();
      this.activeFakes.set('search', fake);
      return fake;
    }
    return null;
  }

  storage() {
    if (globalThis.__ECF_STORAGE__) {
      const fake = globalThis.__ECF_STORAGE__.fake();
      this.activeFakes.set('storage', fake);
      return fake;
    }
    return null;
  }

  logging() {
    if (globalThis.__ECF_LOGGING__) {
      const fake = globalThis.__ECF_LOGGING__.fake();
      this.activeFakes.set('logging', fake);
      return fake;
    }
    return null;
  }

  notifications() {
    if (globalThis.__ECF_NOTIFICATIONS__) {
      const fake = globalThis.__ECF_NOTIFICATIONS__.fake();
      this.activeFakes.set('notifications', fake);
      return fake;
    }
    return null;
  }

  api() {
    if (globalThis.__ECF_API__) {
      const fake = globalThis.__ECF_API__.fake();
      this.activeFakes.set('api', fake);
      return fake;
    }
    return null;
  }

  getFake(name) {
    return this.activeFakes.get(name) || null;
  }
}

export default FakesOrchestrator;
