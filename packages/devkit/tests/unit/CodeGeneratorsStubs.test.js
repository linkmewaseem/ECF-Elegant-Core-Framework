import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { ModelGenerator, ControllerGenerator, StubPublisher } from '../../src/index.js';

describe('CodeGenerators & Stubs Unit Tests', () => {
  const testDir = path.resolve('./storage/test_gen');

  it('should support dry-run preview mode without writing files to disk', async () => {
    const modelGen = new ModelGenerator({ dry: true });
    const targetFile = path.join(testDir, 'Product.js');
    const result = await modelGen.generate('Product', { path: targetFile });

    assert.strictEqual(result.status, 'DRY_RUN');
    assert.ok(result.content.includes('class Product extends Model'));
    assert.strictEqual(fs.existsSync(targetFile), false);
  });

  it('should generate Model and Controller code files', async () => {
    const modelGen = new ModelGenerator({ force: true });
    const targetFile = path.join(testDir, 'Order.js');
    const result = await modelGen.generate('Order', { path: targetFile });

    assert.strictEqual(result.status, 'CREATED');
    assert.ok(fs.existsSync(targetFile));

    // Cleanup
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should publish custom stubs to stubs/ directory', () => {
    const publisher = new StubPublisher();
    const stubsDir = path.resolve('./storage/test_stubs');
    const res = publisher.publish(stubsDir);

    assert.strictEqual(res.success, true);
    assert.ok(fs.existsSync(path.join(stubsDir, 'model.stub')));

    // Cleanup
    if (fs.existsSync(stubsDir)) {
      fs.rmSync(stubsDir, { recursive: true, force: true });
    }
  });
});
