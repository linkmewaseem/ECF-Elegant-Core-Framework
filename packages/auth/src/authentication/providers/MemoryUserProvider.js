import IUserProvider from "../../contracts/IUserProvider.js";

export class MemoryUserProvider extends IUserProvider {
  constructor(users = [], hasher = null) {
    super();
    this.users = new Map();
    this.hasher = hasher;
    for (const u of users) {
      const id = u.id || u.getAuthIdentifier?.() || String(this.users.size + 1);
      this.users.set(String(id), u);
    }
  }

  addUser(user) {
    const id = String(user.id || user.getAuthIdentifier?.() || (this.users.size + 1));
    this.users.set(id, user);
    return user;
  }

  async retrieveById(identifier) {
    return this.users.get(String(identifier)) || null;
  }

  async retrieveByToken(identifier, token) {
    if (identifier) {
      const user = await this.retrieveById(identifier);
      if (!user) return null;
      const rememberToken = user.remember_token || (typeof user.getRememberToken === "function" ? user.getRememberToken() : null);
      return rememberToken === token ? user : null;
    }
    for (const user of this.users.values()) {
      const rememberToken = user.remember_token || (typeof user.getRememberToken === "function" ? user.getRememberToken() : null);
      if (rememberToken === token) {
        return user;
      }
    }
    return null;
  }

  async updateRememberToken(user, token) {
    if (typeof user.setRememberToken === "function") {
      user.setRememberToken(token);
    } else {
      user.remember_token = token;
    }
  }

  async retrieveByCredentials(credentials) {
    if (!credentials || Object.keys(credentials).length === 0) return null;

    for (const user of this.users.values()) {
      let matches = true;
      for (const [key, value] of Object.entries(credentials)) {
        if (key === "password") continue;
        const userVal = user[key] ?? (typeof user.get === "function" ? user.get(key) : undefined);
        if (userVal !== value) {
          matches = false;
          break;
        }
      }
      if (matches) return user;
    }

    return null;
  }

  async validateCredentials(user, credentials) {
    if (!user || !credentials.password) return false;
    const userPassword = user.password || (typeof user.getAuthPassword === "function" ? user.getAuthPassword() : null);
    if (!userPassword) return false;

    if (this.hasher) {
      return this.hasher.check(credentials.password, userPassword);
    }
    return userPassword === credentials.password;
  }
}

export default MemoryUserProvider;
