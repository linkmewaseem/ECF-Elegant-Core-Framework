import IGuard from "../../contracts/IGuard.js";
import { AccountLockedException } from "../../exceptions/AuthException.js";

export class BaseGuard extends IGuard {
  constructor() {
    super();
    this._user = null;
  }

  check() {
    return this.user() !== null;
  }

  guest() {
    return !this.check();
  }

  user() {
    return this._user;
  }

  id() {
    if (this._user) {
      return typeof this._user.getAuthIdentifier === "function"
        ? this._user.getAuthIdentifier()
        : this._user.id || null;
    }
    return null;
  }

  setUser(user) {
    if (user) {
      if (typeof user.isLocked === "function" && user.isLocked()) {
        throw new AccountLockedException("Account is locked.");
      }
      if (typeof user.isDisabled === "function" && user.isDisabled()) {
        throw new AccountLockedException("Account is disabled.");
      }
      if (typeof user.isSuspended === "function" && user.isSuspended()) {
        throw new AccountLockedException("Account is suspended.");
      }
    }
    this._user = user;
    return this;
  }

  hasUser() {
    return this._user !== null;
  }
}

export default BaseGuard;
