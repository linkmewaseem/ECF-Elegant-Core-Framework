/**
 * RingBuffer — Fixed-size circular buffer.
 *
 * When capacity is reached, oldest entries are overwritten.
 * No memory leak — always bounded.
 *
 * Used by: @ecf/observability (span storage), @ecf/devtools (request entries)
 */
export class RingBuffer {
  #buffer;
  #capacity;
  #head = 0;   // next write position
  #size = 0;   // current number of filled slots

  constructor(capacity = 200) {
    if (capacity < 1) throw new RangeError("RingBuffer capacity must be >= 1");
    this.#capacity = capacity;
    this.#buffer = new Array(capacity).fill(null);
  }

  /** Push a new item. Overwrites oldest if full. */
  push(item) {
    this.#buffer[this.#head] = item;
    this.#head = (this.#head + 1) % this.#capacity;
    if (this.#size < this.#capacity) this.#size++;
    return this;
  }

  /**
   * Return all items in insertion order (oldest first).
   */
  toArray() {
    if (this.#size === 0) return [];
    if (this.#size < this.#capacity) {
      return this.#buffer.slice(0, this.#size);
    }
    // Buffer is full — rotate from head (oldest) to head-1 (newest)
    return [
      ...this.#buffer.slice(this.#head),
      ...this.#buffer.slice(0, this.#head),
    ];
  }

  /** Return up to `count` most-recent items. */
  last(count) {
    const all = this.toArray();
    return all.slice(Math.max(0, all.length - count));
  }

  /** Clear all items. */
  clear() {
    this.#buffer.fill(null);
    this.#head = 0;
    this.#size = 0;
    return this;
  }

  get size() { return this.#size; }
  get capacity() { return this.#capacity; }
  get isFull() { return this.#size === this.#capacity; }
  get isEmpty() { return this.#size === 0; }
}

export default RingBuffer;
