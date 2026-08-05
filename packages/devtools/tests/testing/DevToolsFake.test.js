import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DevToolsFake, RequestRecord } from '../../src/index.js';

describe('@ecfjs/devtools — DevToolsFake Testing Helper', () => {
  test('DevToolsFake records and asserts requests', () => {
    const fake = new DevToolsFake();
    const r1 = new RequestRecord({ url: '/api/users' }).seal();
    fake.record(r1);

    assert.doesNotThrow(() => fake.assertRecorded('/api/users'));
    assert.doesNotThrow(() => fake.assertNotRecorded('/api/orders'));
    assert.doesNotThrow(() => fake.assertCount(1));
  });
});
