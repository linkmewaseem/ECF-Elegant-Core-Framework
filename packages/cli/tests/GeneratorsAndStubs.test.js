import { test } from 'node:test';
import assert from 'node:assert/strict';
import { StubCompiler } from '../src/generators/StubCompiler.js';
import { CodeGenerator } from '../src/generators/CodeGenerator.js';

test('Milestone 12 - StubCompiler compiles variables and conditionals', () => {
  const stub = 'class {{ className }} { {{#if isResource}}async index() {} {{/if}} }';
  const compiled = StubCompiler.compile(stub, { className: 'UserController', isResource: true });
  assert.equal(compiled, 'class UserController { async index() {}  }');
});

test('Milestone 12 - CodeGenerator dry-run preview generates valid code', () => {
  const res = CodeGenerator.generate('controller', { name: 'Post', isResource: true }, { dryRun: true });

  assert.equal(res.written, false);
  assert.match(res.targetPath, /PostController\.js$/);
  assert.match(res.content, /export class PostController extends Controller/);
  assert.match(res.content, /async index\(req, res\)/);
});
