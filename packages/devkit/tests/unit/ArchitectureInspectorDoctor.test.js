import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ArchitectureValidator, ProjectInspector, DoctorEngine, UpgradeAssistant } from '../../src/index.js';

describe('ArchitectureValidator, Inspector, Doctor & Upgrade Unit Tests', () => {
  it('should run architecture boundary validation', () => {
    const validator = new ArchitectureValidator();
    const result = validator.validate('.');
    assert.strictEqual(result.passed, true);
  });

  it('should execute project inspection and doctor diagnostics', async () => {
    const inspector = new ProjectInspector();
    const inspResult = inspector.inspect('.');
    assert.strictEqual(inspResult.architectureScore, 100);

    const doctor = new DoctorEngine();
    const docResult = doctor.diagnose();
    assert.strictEqual(docResult.healthy, true);

    const upgrade = new UpgradeAssistant();
    const upResult = await upgrade.checkUpgrade();
    assert.strictEqual(upResult.currentVersion, '1.0.0-rc.1');
  });
});
