import BaseGuard from "./BaseGuard.js";

export class TokenGuard extends BaseGuard {
  constructor(name, provider, tokenKey = "api_token") {
    super();
    this.name = name;
    this.provider = provider;
    this.tokenKey = tokenKey;
  }

  async authenticateToken(rawToken) {
    if (!rawToken) return null;
    const user = await this.provider.retrieveByToken(null, rawToken);
    if (user) {
      this.setUser(user);
    }
    return user;
  }
}

export default TokenGuard;
