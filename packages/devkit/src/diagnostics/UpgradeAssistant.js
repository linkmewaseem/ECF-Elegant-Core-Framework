/**
 * Upgrade Assistant Engine (ecf upgrade).
 */
export class UpgradeAssistant {
  async checkUpgrade({ preview = true } = {}) {
    return {
      currentVersion: '1.0.0-rc.1',
      targetVersion: '1.0.0-rc.1',
      breakingChangesCount: 0,
      migrationNeeded: false,
      preview,
    };
  }
}

export default UpgradeAssistant;
