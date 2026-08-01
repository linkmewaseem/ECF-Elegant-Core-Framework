import IGate from "../contracts/IGate.js";
import { AuthorizationException } from "../exceptions/AuthException.js";
import PolicyManager from "./PolicyManager.js";

export class Gate extends IGate {
  constructor(userResolver = null, policyManager = null) {
    super();
    this.userResolver = userResolver;
    this.policyManager = policyManager || new PolicyManager();
    this.abilities = new Map();
    this.beforeCallbacks = [];
    this.afterCallbacks = [];
  }

  define(ability, callback) {
    if (typeof callback !== "function") {
      throw new Error("Ability callback must be a function.");
    }
    this.abilities.set(ability, callback);
    return this;
  }

  policy(model, policy) {
    if (this.policyManager) {
      this.policyManager.register(model, policy);
    }
    return this;
  }

  before(callback) {
    this.beforeCallbacks.push(callback);
    return this;
  }

  after(callback) {
    this.afterCallbacks.push(callback);
    return this;
  }

  async check(userOrAbility, abilityOrUser, ...args) {
    let resolvedUser;
    let ability;
    let targetArgs;

    if (typeof userOrAbility === "string") {
      ability = userOrAbility;
      resolvedUser = abilityOrUser || (this.userResolver ? await this.userResolver() : null);
      targetArgs = args;
    } else {
      resolvedUser = userOrAbility || (this.userResolver ? await this.userResolver() : null);
      ability = abilityOrUser;
      targetArgs = args;
    }

    // 1. Execute before callbacks
    for (const cb of this.beforeCallbacks) {
      const beforeResult = await cb(resolvedUser, ability, ...targetArgs);
      if (beforeResult !== null && beforeResult !== undefined) {
        return Boolean(beforeResult);
      }
    }

    let result = false;

    // 2. Check direct abilities
    if (this.abilities.has(ability)) {
      const cb = this.abilities.get(ability);
      result = Boolean(await cb(resolvedUser, ...targetArgs));
    } else if (targetArgs.length > 0 && this.policyManager) {
      // 3. Check Policy if target object supplied
      const target = targetArgs[0];
      const policyClass = this.policyManager.getPolicy(target);
      if (policyClass) {
        const policyInstance = this.policyManager.resolvePolicyInstance(policyClass);
        if (typeof policyInstance.before === "function") {
          const pBefore = await policyInstance.before(resolvedUser, ability, ...targetArgs);
          if (pBefore !== null && pBefore !== undefined) {
            result = Boolean(pBefore);
          }
        }
        if (result === false && typeof policyInstance[ability] === "function") {
          result = Boolean(await policyInstance[ability](resolvedUser, ...targetArgs));
        }
      }
    } else {
      // Default deny
      result = false;
    }

    // 4. Execute after callbacks
    for (const cb of this.afterCallbacks) {
      const afterResult = await cb(resolvedUser, ability, result, ...args);
      if (afterResult !== null && afterResult !== undefined) {
        result = Boolean(afterResult);
      }
    }

    return result;
  }

  async allows(user, ability, ...args) {
    return this.check(user, ability, ...args);
  }

  async denies(user, ability, ...args) {
    const allowed = await this.allows(user, ability, ...args);
    return !allowed;
  }

  async authorize(user, ability, ...args) {
    const allowed = await this.allows(user, ability, ...args);
    if (!allowed) {
      throw new AuthorizationException(`This action (${ability}) is unauthorized.`);
    }
    return true;
  }
}

export default Gate;
