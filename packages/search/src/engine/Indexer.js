export class Indexer {
  constructor(getDriverFn, aliasManager) {
    this.getDriverFn = getDriverFn;
    this.aliasManager = aliasManager;
  }

  getDriver() {
    return this.getDriverFn();
  }

  async index(aliasOrName, documents) {
    const targetIndex = this.aliasManager.resolveIndex(aliasOrName);
    const docs = Array.isArray(documents) ? documents : [documents];
    return await this.getDriver().index(targetIndex, docs);
  }

  async remove(aliasOrName, documentIds) {
    const targetIndex = this.aliasManager.resolveIndex(aliasOrName);
    const ids = Array.isArray(documentIds) ? documentIds : [documentIds];
    return await this.getDriver().remove(targetIndex, ids);
  }

  async flush(aliasOrName) {
    const targetIndex = this.aliasManager.resolveIndex(aliasOrName);
    return await this.getDriver().flush(targetIndex);
  }

  async blueGreenReindex(aliasName, buildFn) {
    const tempIndex = `${aliasName}_v${Date.now()}`;
    await buildFn(tempIndex);
    this.aliasManager.swap(aliasName, tempIndex);
    return { success: true, aliasName, activeIndex: tempIndex };
  }
}

export default Indexer;
