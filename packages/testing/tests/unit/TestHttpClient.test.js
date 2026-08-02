import { describe, it } from 'node:test';
import assert from 'node:assert';
import { test, TestHttpClient } from '../../src/index.js';

describe('TestHttpClient & Response Assertions Unit Tests', () => {
  test('should perform HTTP requests and assert status, JSON, and RFC9457 problem details', async ({ http }) => {
    const postRes = await http.post('/api/orders', { amount: 500 });
    postRes.assertCreated();
    postRes.assertStatus(201);
    postRes.assertJson({ success: true, amount: 500 });
    postRes.assertJsonStructure(['success', 'orderId', 'amount']);

    const notFoundRes = await http.get('/404-page');
    notFoundRes.assertNotFound();
    notFoundRes.assertProblem();
  });

  test('should support actingAs auth impersonation and custom headers', async ({ http }) => {
    const client = http.actingAs({ id: 99, email: 'admin@ecf.dev' }).withHeaders({ 'X-Test-Client': 'ECF' });
    const res = await client.get('/api/profile');
    res.assertOk();
    res.assertHeader('content-type', 'application/json');
  });
});
