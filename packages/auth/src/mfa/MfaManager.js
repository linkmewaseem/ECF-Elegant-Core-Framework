export class MfaManager {
  constructor() {
    this.providers = new Map();
  }

  registerProvider(name, provider) {
    this.providers.set(name, provider);
    return this;
  }

  getProvider(name) {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`MFA Provider '${name}' is not registered.`);
    }
    return provider;
  }

  async verify(name, secretOrStore, code, extra = null) {
    const provider = this.getProvider(name);
    return provider.verifyCode(secretOrStore, code, extra);
  }
}

export default MfaManager;
