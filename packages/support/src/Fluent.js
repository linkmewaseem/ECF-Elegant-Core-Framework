export class Fluent {
  constructor(attributes = {}) {
    this.attributes = { ...attributes };

    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }
        if (typeof prop === "string" && prop in target.attributes) {
          return target.attributes[prop];
        }
        return undefined;
      },
      set(target, prop, value, receiver) {
        if (prop in target) {
          return Reflect.set(target, prop, value, receiver);
        }
        target.attributes[prop] = value;
        return true;
      },
    });
  }

  get(key, defaultValue = null) {
    return this.attributes[key] !== undefined ? this.attributes[key] : defaultValue;
  }

  set(key, value) {
    this.attributes[key] = value;
    return this;
  }

  all() {
    return { ...this.attributes };
  }

  toJSON() {
    return this.all();
  }
}

export default Fluent;
