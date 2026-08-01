import { Arr } from "@ecf/support";
import IConfigRepository from "./contracts/IConfigRepository.js";

export class ConfigRepository extends IConfigRepository {
  constructor(items = {}, eventsManager = null) {
    super();
    this.items = { ...items };
    this.events = eventsManager;
  }

  get(key, defaultValue = null) {
    if (!key) return this.items;
    return Arr.get(this.items, key, defaultValue);
  }

  set(key, value) {
    Arr.set(this.items, key, value);
    if (this.events) {
      this.events.dispatch("ConfigChanged", { key, value });
    }
    return this;
  }

  has(key) {
    return Arr.has(this.items, key);
  }

  push(key, value) {
    const current = this.get(key, []);
    const array = Array.isArray(current) ? current : [current];
    array.push(value);
    this.set(key, array);
    return this;
  }

  prepend(key, value) {
    const current = this.get(key, []);
    const array = Array.isArray(current) ? current : [current];
    array.unshift(value);
    this.set(key, array);
    return this;
  }

  merge(key, value) {
    const current = this.get(key, {});
    const obj = typeof current === "object" && current !== null ? current : {};
    this.set(key, { ...obj, ...value });
    return this;
  }

  // Typed Accessors
  boolean(key, defaultValue = false) {
    const val = this.get(key, defaultValue);
    return Boolean(val);
  }

  number(key, defaultValue = 0) {
    const val = this.get(key, defaultValue);
    const num = Number(val);
    return isNaN(num) ? defaultValue : num;
  }

  array(key, defaultValue = []) {
    const val = this.get(key, defaultValue);
    return Arr.wrap(val);
  }

  object(key, defaultValue = {}) {
    const val = this.get(key, defaultValue);
    return typeof val === "object" && val !== null ? val : defaultValue;
  }

  all() {
    return { ...this.items };
  }
}

export default ConfigRepository;
