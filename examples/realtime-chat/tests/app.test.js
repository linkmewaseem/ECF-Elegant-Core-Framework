import { describe, it } from 'node:test';
import assert from 'node:assert';
import { test } from '@ecf/testing';
import { createChatServer } from '../app.js';

describe('Realtime Chat Sample App Unit Tests', () => {
  test('should broadcast message sent on channel', async ({ fake }) => {
    fake.broadcast();
    const server = createChatServer();
    const res = await server.sendMessage({ channel: 'support', message: 'Need help', sender: 'User1' });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.channel, 'support');
  });
});
