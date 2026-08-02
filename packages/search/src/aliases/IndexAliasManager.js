export class IndexAliasManager {
  constructor() {
    this.aliases = new Map();
  }

  setAlias(aliasName, targetIndex) {
    this.aliases.set(aliasName, targetIndex);
    return this;
  }

  resolveIndex(aliasOrIndex) {
    return this.aliases.get(aliasOrIndex) || aliasOrIndex;
  }

  swap(aliasName, newTargetIndex) {
    const oldTarget = this.aliases.get(aliasName) || aliasName;
    this.aliases.set(aliasName, newTargetIndex);
    return { aliasName, oldTarget, newTarget: newTargetIndex };
  }

  removeAlias(aliasName) {
    return this.aliases.delete(aliasName);
  }
}

export default IndexAliasManager;
