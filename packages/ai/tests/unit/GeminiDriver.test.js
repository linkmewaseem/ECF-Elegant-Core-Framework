import { describe, it } from 'node:test';
import assert from 'node:assert';
import { GeminiDriver } from '../../src/drivers/GeminiDriver.js';

describe('GeminiDriver Unit Tests', () => {
  it('should resolve model aliases and fallback models', () => {
    const driver = new GeminiDriver({ model: '3.1 pro' });
    assert.strictEqual(driver.resolveModelName('3.1 pro'), 'gemini-3.1-pro-preview');
    assert.strictEqual(driver.resolveModelName('gemini-1.5-pro'), 'gemini-3.1-pro-preview');
  });

  it('should sanitize conversation history and system instructions', () => {
    const driver = new GeminiDriver();
    const history = [
      { role: 'system', content: 'You are an AI assistant for ECF Framework.' },
      { role: 'user', content: 'Hello' },
      { role: 'user', content: 'Tell me about ECF' },
      { role: 'assistant', content: 'ECF is an enterprise framework.' }
    ];

    const { systemText, contents } = driver.sanitizeHistoryAndSystem('How many packages?', {
      system: 'Global system prompt.',
      history
    });

    assert.ok(systemText.includes('Global system prompt.'));
    assert.ok(systemText.includes('You are an AI assistant for ECF Framework.'));

    // Check alternating user/model turns
    assert.strictEqual(contents[0].role, 'user');
    assert.ok(contents[0].parts[0].text.includes('Hello'));
    assert.ok(contents[0].parts[0].text.includes('Tell me about ECF'));
    assert.strictEqual(contents[1].role, 'model');
    assert.strictEqual(contents[2].role, 'user');
    assert.strictEqual(contents[2].parts[0].text, 'How many packages?');
  });

  it('should return mock response in test mode', async () => {
    const driver = new GeminiDriver({ model: 'gemini-3.1-pro-preview' });
    const res = await driver.chat('What is ECF?');
    assert.strictEqual(res.model, 'gemini-3.1-pro-preview');
    assert.ok(res.text.includes('What is ECF?'));
  });

  it('should stream chunks using fallback generator when in test mode', async () => {
    const driver = new GeminiDriver({ model: 'gemini-3.1-pro-preview' });
    const chunks = [];
    for await (const chunk of driver.stream('Hello world')) {
      chunks.push(chunk);
    }
    assert.ok(chunks.length > 0);
  });

  it('should return 768-dim embedding vector in test mode', async () => {
    const driver = new GeminiDriver();
    const vector = await driver.embed('Test text');
    assert.strictEqual(vector.length, 768);
  });
});
