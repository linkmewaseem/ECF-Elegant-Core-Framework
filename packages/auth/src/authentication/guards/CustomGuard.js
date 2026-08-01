import BaseGuard from "./BaseGuard.js";

export class CustomGuard extends BaseGuard {
  constructor(callback) {
    super();
    this.callback = callback;
  }

  async authenticate(context = {}) {
    const user = await this.callback(context);
    if (user) {
      this.setUser(user);
    }
    return user;
  }
}

export default CustomGuard;
