import Arr from "./Arr.js";

export class Collection {
  constructor(items = []) {
    this.items = Arr.wrap(items);
  }

  static make(items = []) {
    return new Collection(items);
  }

  all() {
    return [...this.items];
  }

  get(index, defaultValue = null) {
    if (typeof index === "number") {
      return this.items[index] !== undefined ? this.items[index] : defaultValue;
    }
    return Arr.get(this.items, index, defaultValue);
  }

  first(callback = null, defaultValue = null) {
    if (!callback) {
      return this.items.length > 0 ? this.items[0] : defaultValue;
    }
    const found = this.items.find(callback);
    return found !== undefined ? found : defaultValue;
  }

  last(callback = null, defaultValue = null) {
    if (!callback) {
      return this.items.length > 0 ? this.items[this.items.length - 1] : defaultValue;
    }
    const reversed = [...this.items].reverse();
    const found = reversed.find(callback);
    return found !== undefined ? found : defaultValue;
  }

  map(callback) {
    return new Collection(this.items.map(callback));
  }

  filter(callback) {
    return new Collection(this.items.filter(callback));
  }

  reject(callback) {
    return new Collection(this.items.filter((item, i) => !callback(item, i)));
  }

  pluck(valueKey, keyBy = null) {
    return new Collection(Arr.pluck(this.items, valueKey, keyBy));
  }

  where(key, operator, value = undefined) {
    if (value === undefined) {
      value = operator;
      operator = "===";
    }

    return this.filter((item) => {
      const val = Arr.get(item, key);
      switch (operator) {
        case "===":
        case "==":
          return val == value;
        case "!==":
        case "!=":
          return val != value;
        case ">":
          return val > value;
        case ">=":
          return val >= value;
        case "<":
          return val < value;
        case "<=":
          return val <= value;
        default:
          return false;
      }
    });
  }

  keyBy(key) {
    const result = {};
    for (const item of this.items) {
      const k = Arr.get(item, key);
      if (k !== null && k !== undefined) {
        result[k] = item;
      }
    }
    return result;
  }

  groupBy(key) {
    const result = {};
    for (const item of this.items) {
      const k = Arr.get(item, key) ?? "undefined";
      if (!result[k]) result[k] = new Collection();
      result[k].push(item);
    }
    return result;
  }

  push(item) {
    this.items.push(item);
    return this;
  }

  count() {
    return this.items.length;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  isNotEmpty() {
    return !this.isEmpty();
  }

  toArray() {
    return this.all();
  }

  toJSON() {
    return this.all();
  }
}

export default Collection;
