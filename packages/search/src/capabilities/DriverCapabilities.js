export class DriverCapabilities {
  constructor(capabilities = []) {
    this.capabilitiesSet = new Set(capabilities);
  }

  supports(feature) {
    return this.capabilitiesSet.has(feature);
  }

  getCapabilities() {
    return Array.from(this.capabilitiesSet);
  }

  validateSupport(feature) {
    if (!this.supports(feature)) {
      console.warn(`[Search Warning] Current search driver does not support feature [${feature}]. Feature will be ignored or degraded.`);
      return false;
    }
    return true;
  }
}

export default DriverCapabilities;
