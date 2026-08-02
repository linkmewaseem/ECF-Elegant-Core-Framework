import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ConversationMemory, PromptRegistry, AiManager } from '../../src/index.js';

describe('Memory, Prompts & Streaming Unit Tests', () => {
  it('should manage conversation memory state', () => {
    const memory = new ConversationMemory('session-1');
    memory.addMessage('user', 'What is ECF?').addMessage('assistant', 'ECF is a framework.');

    const history = memory.getHistory();
    assert.strictEqual(history.length, 2);
    assert.strictEqual(history[0].content, 'What is ECF?');
  });

  it('should support prompt template versioning', () => {
    const registry = new PromptRegistry();
    registry.register('welcome', 'Hello {{name}} v1', 'v1');
    registry.register('welcome', 'Hi {{name}} v2!', 'v2');

    const v1Text = registry.render('welcome@v1', { name: 'Alice' });
    assert.strictEqual(v1Text, 'Hello Alice v1');

    const v2Text = registry.render('welcome@v2', { name: 'Bob' });
    assert.strictEqual(v2Text, 'Hi Bob v2!');
  });

  it('should stream AI chat token response', async () => {
    const ai = new AiManager();
    const tokens = [];
    for await (const chunk of ai.stream('Stream test', { driver: 'memory' })) {
      tokens.push(chunk);
    }
    assert.ok(tokens.length > 0);
  });
});
