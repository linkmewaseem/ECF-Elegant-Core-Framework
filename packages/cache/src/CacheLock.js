import { Str } from "@ecf/support";
import ICacheLock from "./contracts/ICacheLock.js";

export class CacheLock extends ICacheLock {
  constructor(store, name, seconds = 60, ownerId = null) {
    super();
    this.store = store;
    this.name = `lock:${name}`;
    this.seconds = seconds;
    this.ownerId = ownerId || Str.uuid();
  }

  acquire() {
    const existing = this.store.get(this.name);
    if (existing && existing.ownerId !== this.ownerId) {
      return false;
    }
    this.store.put(this.name, { ownerId: this.ownerId }, this.seconds);
    return true;
  }

  release() {
    if (this.isOwned()) {
      this.store.forget(this.name);
      return true;
    }
    return false;
  }

  forceRelease() {
    this.store.forget(this.name);
    return true;
  }

  owner() {
    return this.ownerId;
  }

  isOwned() {
    const existing = this.store.get(this.name);
    return existing && existing.ownerId === this.ownerId;
  }

  extend(extraSeconds) {
    if (this.isOwned()) {
      this.seconds += extraSeconds;
      this.store.put(this.name, { ownerId: this.ownerId }, this.seconds);
      return true;
    }
    return false;
  }

  async block(secondsToWait, callback) {
    const startTime = Date.now();
    const waitMs = secondsToWait * 1000;

    while (Date.now() - startTime < waitMs) {
      if (this.acquire()) {
        try {
          return await callback();
        } finally {
          this.release();
        }
      }
      await new Promise((r) => setTimeout(r, 50));
    }

    throw new Error(`Timeout waiting to acquire lock [${this.name}].`);
  }
}

export default CacheLock;
