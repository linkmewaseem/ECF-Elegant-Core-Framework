export class Arr {
  static wrap(value) {
    if (value === null || value === undefined) return [];
    return Array.isArray(value) ? value : [value];
  }

  static get(array, key, defaultValue = null) {
    if (!array || typeof array !== "object") return defaultValue;
    if (key === null || key === undefined) return array;

    if (key in array) return array[key];

    const keys = key.split(".");
    let current = array;

    for (const k of keys) {
      if (current === null || current === undefined || typeof current !== "object") {
        return defaultValue;
      }
      if (!(k in current)) return defaultValue;
      current = current[k];
    }

    return current;
  }

  static has(array, key) {
    if (!array || typeof array !== "object" || !key) return false;
    const keys = key.split(".");
    let current = array;

    for (const k of keys) {
      if (current === null || current === undefined || typeof current !== "object" || !(k in current)) {
        return false;
      }
      current = current[k];
    }

    return true;
  }

  static set(array, key, value) {
    if (!array || typeof array !== "object") return array;

    const keys = key.split(".");
    let current = array;

    while (keys.length > 1) {
      const k = keys.shift();
      if (!(k in current) || typeof current[k] !== "object" || current[k] === null) {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys.shift()] = value;
    return array;
  }

  static forget(array, key) {
    if (!array || typeof array !== "object" || !key) return array;

    const keys = key.split(".");
    let current = array;

    while (keys.length > 1) {
      const k = keys.shift();
      if (!(k in current) || typeof current[k] !== "object") {
        return array;
      }
      current = current[k];
    }

    delete current[keys.shift()];
    return array;
  }

  static only(array, keys) {
    const keyArray = this.wrap(keys);
    const result = {};
    for (const k of keyArray) {
      if (k in array) {
        result[k] = array[k];
      }
    }
    return result;
  }

  static except(array, keys) {
    const keyArray = this.wrap(keys);
    const result = { ...array };
    for (const k of keyArray) {
      delete result[k];
    }
    return result;
  }

  static pluck(array, valueKey, keyBy = null) {
    const results = keyBy ? {} : [];
    const list = this.wrap(array);

    for (const item of list) {
      const val = this.get(item, valueKey);
      if (keyBy) {
        const k = this.get(item, keyBy);
        if (k !== null && k !== undefined) {
          results[k] = val;
        }
      } else {
        results.push(val);
      }
    }

    return results;
  }

  static flatten(array, depth = Infinity) {
    return Array.isArray(array) ? array.flat(depth) : [array];
  }
}

export default Arr;
