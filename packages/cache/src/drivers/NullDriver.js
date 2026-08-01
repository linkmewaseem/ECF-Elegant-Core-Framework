import ICacheDriver from "../contracts/ICacheDriver.js";

export class NullDriver extends ICacheDriver {
  get(key, defaultValue = null) { return defaultValue; }
  put(key, value, ttlSeconds = 0) { return true; }
  has(key) { return false; }
  forget(key) { return true; }
  flush() { return true; }
}

export default NullDriver;
