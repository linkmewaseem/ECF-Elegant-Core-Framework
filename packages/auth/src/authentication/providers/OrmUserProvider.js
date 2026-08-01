import IUserProvider from "../../contracts/IUserProvider.js";

export class OrmUserProvider extends IUserProvider {
  constructor(modelOrResolver, hasher = null) {
    super();
    this.modelOrResolver = modelOrResolver;
    this.hasher = hasher;
  }

  getModel() {
    if (typeof this.modelOrResolver === "function" && !(this.modelOrResolver.prototype?.constructor)) {
      return this.modelOrResolver();
    }
    return this.modelOrResolver;
  }

  async retrieveById(identifier) {
    const model = this.getModel();
    if (typeof model.find === "function") {
      return model.find(identifier);
    }
    if (typeof model.where === "function") {
      return model.where("id", identifier).first();
    }
    return null;
  }

  async retrieveByToken(identifier, token) {
    const user = await this.retrieveById(identifier);
    if (!user) return null;
    const rememberToken = typeof user.getRememberToken === "function" ? user.getRememberToken() : user.remember_token;
    return rememberToken === token ? user : null;
  }

  async updateRememberToken(user, token) {
    if (typeof user.setRememberToken === "function") {
      user.setRememberToken(token);
    } else {
      user.remember_token = token;
    }
    if (typeof user.save === "function") {
      await user.save();
    }
  }

  async retrieveByCredentials(credentials) {
    if (!credentials || Object.keys(credentials).length === 0) return null;
    const model = this.getModel();

    let query = typeof model.query === "function" ? model.query() : model;
    for (const [key, value] of Object.entries(credentials)) {
      if (key === "password") continue;
      if (typeof query.where === "function") {
        query = query.where(key, value);
      }
    }

    if (typeof query.first === "function") {
      return query.first();
    }
    return null;
  }

  async validateCredentials(user, credentials) {
    if (!user || !credentials.password) return false;
    const userPassword = typeof user.getAuthPassword === "function" ? user.getAuthPassword() : user.password;
    if (!userPassword) return false;

    if (this.hasher) {
      return this.hasher.check(credentials.password, userPassword);
    }
    return userPassword === credentials.password;
  }
}

export default OrmUserProvider;
