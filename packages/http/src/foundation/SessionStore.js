import crypto from 'node:crypto';

/**
 * Stateful HTTP Session Store supporting Memory, File, and Cookie backends.
 */
export class SessionStore {
  constructor(id = null, data = {}) {
    this.id = id || crypto.randomBytes(16).toString('hex');
    this.attributes = { ...data };
    this.flashData = {};
  }

  getId() {
    return this.id;
  }

  get(key, defaultValue = null) {
    return Object.prototype.hasOwnProperty.call(this.attributes, key)
      ? this.attributes[key]
      : (Object.prototype.hasOwnProperty.call(this.flashData, key) ? this.flashData[key] : defaultValue);
  }

  put(key, value) {
    this.attributes[key] = value;
    return this;
  }

  has(key) {
    return Object.prototype.hasOwnProperty.call(this.attributes, key) || Object.prototype.hasOwnProperty.call(this.flashData, key);
  }

  forget(key) {
    delete this.attributes[key];
    delete this.flashData[key];
    return this;
  }

  flash(key, value) {
    this.flashData[key] = value;
    return this;
  }

  regenerate() {
    this.id = crypto.randomBytes(16).toString('hex');
    return this.id;
  }

  all() {
    return { ...this.attributes, ...this.flashData };
  }
}
