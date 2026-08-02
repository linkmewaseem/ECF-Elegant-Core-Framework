export class DriverRegistry {
  constructor() {
    this.factories = new Map();
    this.instances = new Map();
  }

  register(name, factory) {
    this.factories.set(name, factory);
    return this;
  }

  has(name) {
    return this.factories.has(name) || this.instances.has(name);
  }

  get(name) {
    if (this.instances.has(name)) {
      return this.instances.get(name);
    }
    if (this.factories.has(name)) {
      const instance = this.factories.get(name)();
      this.instances.set(name, instance);
      return instance;
    }
    throw new Error(`Search driver [${name}] is not registered.`);
  }

  setInstance(name, instance) {
    this.instances.set(name, instance);
  }
}

export default DriverRegistry;
