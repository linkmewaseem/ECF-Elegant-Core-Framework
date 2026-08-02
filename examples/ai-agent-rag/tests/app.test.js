import { describe, it } from 'node:test';
import assert from 'node:assert';
import { test } from '@ecf/testing';
import { askSupportBot } from '../app.js';

describe('AI Agent RAG Sample App Unit Tests', () => {
  test('should execute RAG question answering with memory history', async ({ fake }) => {
    fake.ai();
    const result = await askSupportBot('What is the refund policy?');

    assert.strictEqual(result.question, 'What is the refund policy?');
    assert.ok(result.answer);
    assert.strictEqual(result.history.length, 2);
  });
});
