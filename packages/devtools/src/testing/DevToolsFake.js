import assert from 'node:assert/strict';
import { EntryStore } from '../core/EntryStore.js';

export class DevToolsFake {
  #store;

  constructor() {
    this.#store = new EntryStore({ capacity: 1000 });
  }

  record(record) {
    this.#store.add(record);
    return this;
  }

  assertRecorded(urlOrPredicate) {
    const entries = this.#store.all();
    const found = entries.some((e) =>
      typeof urlOrPredicate === 'function' ? urlOrPredicate(e) : e.url.includes(urlOrPredicate)
    );
    assert.ok(found, `Expected DevTools to record request matching "${urlOrPredicate}", but none was found.`);
  }

  assertNotRecorded(urlOrPredicate) {
    const entries = this.#store.all();
    const found = entries.some((e) =>
      typeof urlOrPredicate === 'function' ? urlOrPredicate(e) : e.url.includes(urlOrPredicate)
    );
    assert.ok(!found, `Expected DevTools NOT to record request matching "${urlOrPredicate}", but one was recorded.`);
  }

  assertCount(expectedCount) {
    assert.equal(this.#store.count, expectedCount, `Expected DevTools to have recorded ${expectedCount} requests, got ${this.#store.count}.`);
  }

  clear() {
    this.#store.clear();
    return this;
  }

  get store() {
    return this.#store;
  }
}

export default DevToolsFake;
