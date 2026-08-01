import BaseGuard from "./BaseGuard.js";
import ApiKeyService from "../tokens/ApiKeyService.js";

export class ApiKeyGuard extends BaseGuard {
  constructor(name, provider, apiKeyService = null) {
    super();
    this.name = name;
    this.provider = provider;
    this.apiKeyService = apiKeyService || new ApiKeyService();
  }

  async authenticateKey(apiKey) {
    if (!apiKey) return null;
    const hashedKey = this.apiKeyService.hashKey(apiKey);
    const user = await this.provider.retrieveByToken(null, hashedKey);
    if (user) {
      this.setUser(user);
    }
    return user;
  }
}

export default ApiKeyGuard;
