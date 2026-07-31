/**
 * Authorization Gate Manager.
 */
export class Gate {
  constructor() {
    this.abilities = new Map();
    this.policies = new Map();
  }

  /**
   * Define an authorization ability callback.
   * @param {string} ability
   * @param {Function} callback
   */
  define(ability, callback) {
    this.abilities.set(ability, callback);
    return this;
  }

  /**
   * Register a Resource Policy class.
   * @param {Function|class} ModelClass
   * @param {object} policyInstance
   */
  policy(ModelClass, policyInstance) {
    this.policies.set(ModelClass, policyInstance);
    return this;
  }

  /**
   * Determine if user has given ability.
   * @param {string} ability
   * @param {object} user
   * @param {...any} args
   * @returns {Promise<boolean>}
   */
  async allows(ability, user, ...args) {
    if (this.abilities.has(ability)) {
      const callback = this.abilities.get(ability);
      return Boolean(await callback(user, ...args));
    }

    if (args.length > 0 && args[0]) {
      const resource = args[0];
      const PolicyClass = resource.constructor;
      if (this.policies.has(PolicyClass)) {
        const policy = this.policies.get(PolicyClass);
        if (typeof policy[ability] === 'function') {
          return Boolean(await policy[ability](user, resource, ...args.slice(1)));
        }
      }
    }

    return false;
  }

  async denies(ability, user, ...args) {
    return !(await this.allows(ability, user, ...args));
  }
}
