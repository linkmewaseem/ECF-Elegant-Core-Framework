export class PolicyManager {
  constructor() {
    this.policies = new Map();
  }

  register(modelOrClass, policyOrClass) {
    const key = typeof modelOrClass === "string" ? modelOrClass : modelOrClass.name;
    this.policies.set(key, policyOrClass);
    return this;
  }

  getPolicy(modelOrClass) {
    if (!modelOrClass) return null;
    const key = typeof modelOrClass === "string" ? modelOrClass : (modelOrClass.name || modelOrClass.constructor?.name);
    return this.policies.get(key) || null;
  }

  resolvePolicyInstance(policy) {
    if (typeof policy === "function" && policy.prototype) {
      return new policy();
    }
    return policy;
  }
}

export default PolicyManager;
