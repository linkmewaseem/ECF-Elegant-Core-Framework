import IAuthManager from "../contracts/IAuthManager.js";

export class AuthManager extends IAuthManager {
  constructor(app, guardManager) {
    super();
    this.app = app;
    this.guardManager = guardManager;
  }

  guard(name = null) {
    return this.guardManager.guard(name);
  }

  setDefaultDriver(name) {
    this.guardManager.setDefaultDriver(name);
  }

  user() {
    return this.guard().user();
  }

  id() {
    return this.guard().id();
  }

  check() {
    return this.guard().check();
  }

  guest() {
    return this.guard().guest();
  }

  login(user, remember = false) {
    return this.guard().login(user, remember);
  }

  logout() {
    return this.guard().logout();
  }

  attempt(credentials = {}, remember = false) {
    return this.guard().attempt(credentials, remember);
  }

  viaRemember() {
    return typeof this.guard().viaRemember === "function" ? this.guard().viaRemember() : false;
  }

  hasUser() {
    return this.guard().hasUser();
  }
}

export default AuthManager;
