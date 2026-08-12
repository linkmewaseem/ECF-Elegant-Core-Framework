import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { EcfMakeControllerCommand, EcfMakeModelCommand } from '../src/commands/EcfMakeCommands.js';
import { Input } from '../src/kernel/Input.js';
import { Output } from '../src/output/Output.js';

test('EcfMakeControllerCommand generates resource controller file', async () => {
  const cmd = new EcfMakeControllerCommand();
  const input = new Input({ name: 'TestUser' }, { resource: true, force: true }, []);
  const messages = [];
  const output = new Output({ write: (msg) => messages.push(msg) });

  await cmd.handle(input, output);

  assert.ok(messages.some(m => m.includes('Generated controller')));
  const targetFile = path.join(process.cwd(), 'app/Http/Controllers/TestUserController.js');
  assert.ok(fs.existsSync(targetFile));

  const content = fs.readFileSync(targetFile, 'utf-8');
  assert.match(content, /export class TestUserController extends Controller/);
  assert.match(content, /async index\(req, res\)/);

  // Clean up test file & directories
  fs.unlinkSync(targetFile);
});

test('EcfMakeModelCommand generates model file', async () => {
  const cmd = new EcfMakeModelCommand();
  const input = new Input({ name: 'TestPost' }, { force: true }, []);
  const messages = [];
  const output = new Output({ write: (msg) => messages.push(msg) });

  await cmd.handle(input, output);

  assert.ok(messages.some(m => m.includes('Generated model')));
  const targetFile = path.join(process.cwd(), 'app/Models/TestPost.js');
  assert.ok(fs.existsSync(targetFile));

  const content = fs.readFileSync(targetFile, 'utf-8');
  assert.match(content, /export class TestPost extends Model/);

  // Clean up test file
  fs.unlinkSync(targetFile);
});
