import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { BlueprintCompiler } from '../../src/index.js';

describe('BlueprintCompiler Unit Tests', () => {
  const testDir = path.resolve('./storage/test_blueprint');

  it('should compile declarative YAML/JSON blueprint into full feature stack', async () => {
    const compiler = new BlueprintCompiler({ dry: true });
    const blueprintData = {
      models: {
        BlogPost: {
          title: 'string',
          content: 'text',
        },
      },
    };

    const results = await compiler.compile(blueprintData);
    assert.strictEqual(results.length, 6); // Model, Migration, Controller, Resource, Policy, Test
    assert.ok(results.every((r) => r.status === 'DRY_RUN'));
  });
});
