export class LazyCollection {
  constructor(source = []) {
    if (typeof source === "function") {
      this.source = source;
    } else if (Symbol.iterator in Object(source)) {
      this.source = function* () {
        yield* source;
      };
    } else {
      this.source = function* () {};
    }
  }

  static make(source = []) {
    return new LazyCollection(source);
  }

  *[Symbol.iterator]() {
    yield* this.source();
  }

  map(callback) {
    const self = this;
    return new LazyCollection(function* () {
      let index = 0;
      for (const item of self) {
        yield callback(item, index++);
      }
    });
  }

  filter(callback) {
    const self = this;
    return new LazyCollection(function* () {
      let index = 0;
      for (const item of self) {
        if (callback(item, index++)) {
          yield item;
        }
      }
    });
  }

  take(limit) {
    const self = this;
    return new LazyCollection(function* () {
      let count = 0;
      for (const item of self) {
        if (count++ >= limit) break;
        yield item;
      }
    });
  }

  toArray() {
    return [...this];
  }
}

export default LazyCollection;
