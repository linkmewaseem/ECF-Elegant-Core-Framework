import { Gate as CoreGate } from "@ecfjs/auth";

/**
 * Authorization Gate Manager bridge delegating to @ecfjs/auth.
 */
export class Gate {
  constructor() {
    this._gate = new CoreGate();
    this.abilities = this._gate.abilities;
  }

  define(ability, callback) {
    this._gate.define(ability, callback);
    return this;
  }

  policy(ModelClass, policyInstance) {
    this._gate.policy(ModelClass, policyInstance);
    return this;
  }

  async allows(ability, user, ...args) {
    return this._gate.allows(user, ability, ...args);
  }

  async denies(ability, user, ...args) {
    return this._gate.denies(user, ability, ...args);
  }
}

export default Gate;

