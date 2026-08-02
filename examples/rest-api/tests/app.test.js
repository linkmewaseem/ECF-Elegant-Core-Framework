import { describe, it } from 'node:test';
import assert from 'node:assert';
import { test } from '@ecf/testing';
import { createServer } from '../app.js';

describe('REST API Sample App Unit Tests', () => {
  test('should return list of products from GET /api/v1/products', async ({ http }) => {
    const server = createServer();
    const res = await server.handle({ url: '/api/v1/products' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.length, 2);
  });
});
