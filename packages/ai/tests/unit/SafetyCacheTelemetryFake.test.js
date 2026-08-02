import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AiSafety, SemanticCache, TokenTracker, AiCollector, AiManager } from '../../src/index.js';

describe('Safety, Cache, Telemetry & Testing Fake Unit Tests', () => {
  it('should moderate content and redact PII', () => {
    const mod = AiSafety.moderate('Normal user text');
    assert.strictEqual(mod.flagged, false);

    const redacted = AiSafety.redactPii('Contact john@example.com or 123-45-6789');
    assert.ok(redacted.includes('[REDACTED_EMAIL]'));
    assert.ok(redacted.includes('[REDACTED_SSN]'));
  });

  it('should calculate estimated token costs', () => {
    const cost = TokenTracker.calculateCost(1000, 500, 'gpt-4o');
    assert.ok(cost > 0);
  });

  it('should support testing fakes and recording assertions', async () => {
    const ai = new AiManager();
    const fake = ai.fake();

    await ai.chat('Test chat prompt', { driver: 'memory' });
    await ai.embed('Test embedding text', { driver: 'memory' });

    fake.assertChatted('chat prompt');
    fake.assertEmbedded('embedding text');
  });
});
