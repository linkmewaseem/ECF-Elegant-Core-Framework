import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AiManager, AI, OpenAiDriver, AnthropicDriver, GeminiDriver, OllamaDriver, GroqDriver } from '../../src/index.js';

describe('AiManager & Drivers Unit Tests', () => {
  it('should resolve drivers and return chat responses', async () => {
    const ai = new AiManager();
    const openaiRes = await ai.chat('Hello OpenAI', { driver: 'openai' });
    assert.ok(openaiRes.text.includes('OpenAI'));

    const anthropicRes = await ai.chat('Hello Claude', { driver: 'anthropic' });
    assert.ok(anthropicRes.text.includes('Anthropic'));

    const geminiRes = await ai.chat('Hello Gemini', { driver: 'gemini' });
    assert.ok(geminiRes.text.includes('Google'));
  });

  it('should return driver capability matrices', () => {
    const driver = new OpenAiDriver();
    const caps = driver.getCapabilities();
    assert.strictEqual(caps.supportsChat, true);
    assert.strictEqual(caps.supportsEmbedding, true);
  });
});
