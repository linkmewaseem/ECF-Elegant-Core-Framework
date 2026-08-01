export class GuardManager {
  constructor(app = null) {
    this.app = app;
    this.guards = new Map();
    this.customCreators = new Map();
    this.defaultDriver = "session";
  }

  setDefaultDriver(name) {
    this.defaultDriver = name;
  }

  getDefaultDriver() {
    return this.defaultDriver;
  }

  extend(driver, creator) {
    this.customCreators.set(driver, creator);
    return this;
  }

  guard(name = null) {
    const guardName = name || this.defaultDriver;
    if (!this.guards.has(guardName)) {
      this.guards.set(guardName, this.resolve(guardName));
    }
    return this.guards.get(guardName);
  }

  resolve(name) {
    if (this.customCreators.has(name)) {
      const creator = this.customCreators.get(name);
      return creator(this.app, name);
    }
    throw new Error(`Guard driver '${name}' is not configured.`);
  }

  registerGuard(name, guardInstance) {
    this.guards.set(name, guardInstance);
  }
}

export default GuardManager;
