import BaseGuard from "./BaseGuard.js";

export class JwtGuard extends BaseGuard {
  constructor(name, jwtService, provider, inputKey = "token") {
    super();
    this.name = name;
    this.jwtService = jwtService;
    this.provider = provider;
    this.inputKey = inputKey;
  }

  async authenticateToken(tokenString) {
    if (!tokenString) return null;
    const payload = await this.jwtService.decode(tokenString);
    if (!payload || !payload.sub) return null;

    const user = await this.provider.retrieveById(payload.sub);
    if (user) {
      this.setUser(user);
    }
    return user;
  }

  async issueToken(user, claims = {}, options = {}) {
    const userId = typeof user.getAuthIdentifier === "function" ? user.getAuthIdentifier() : user.id;
    return this.jwtService.encode({
      sub: userId,
      ...claims
    }, options);
  }
}

export default JwtGuard;
