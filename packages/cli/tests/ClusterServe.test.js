import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import { EcfServeCommand } from '../src/commands/EcfServeCommand.js';

describe('EcfServeCommand & Cluster Mode Tests', () => {
  it('parses serve command signature and options', () => {
    const cmd = new EcfServeCommand();
    const sig = cmd.getParsedSignature();

    assert.equal(sig.name, 'serve');
    assert.ok(sig.options.some(o => o.name === 'port'));
    assert.ok(sig.options.some(o => o.name === 'cluster'));
    assert.ok(sig.options.some(o => o.name === 'workers'));
  });

  it('runs serve command in single process mode', async () => {
    const cmd = new EcfServeCommand();
    const mockOutput = { line: () => {} };
    const mockInput = {
      options: {
        port: '4000',
        host: '127.0.0.1',
        entry: 'non-existent-entry.js'
      }
    };

    const result = await cmd.handle(mockInput, mockOutput);

    assert.equal(result.mode, 'single');
    assert.equal(result.port, '4000');
    assert.equal(result.host, '127.0.0.1');
    assert.equal(process.env.PORT, '4000');
  });

  it('detects available CPU cores for cluster mode configuration', () => {
    const cpus = os.cpus();
    assert.ok(Array.isArray(cpus));
    assert.ok(cpus.length >= 1);
  });
});
