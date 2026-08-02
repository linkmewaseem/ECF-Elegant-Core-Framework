import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DevKitManager, DevKit } from '../../src/index.js';

describe('DevKitManager Unit Tests', () => {
  it('should resolve registered generators', () => {
    const devkit = new DevKitManager();
    const modelGen = devkit.getGenerator('model');
    assert.ok(modelGen);
    const controllerGen = devkit.getGenerator('controller');
    assert.ok(controllerGen);
  });

  it('should support static DevKit facade', () => {
    assert.ok(typeof DevKit.make === 'function');
    assert.ok(typeof DevKit.doctor === 'function');
  });
});
