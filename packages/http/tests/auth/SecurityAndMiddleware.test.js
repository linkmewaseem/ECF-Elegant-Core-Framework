import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CookieJar, SessionStore, Gate, Policy, RateLimiter, ThrottleRequests,
  HttpCache, NativeRequest, AbstractResponse, RateLimitException
} from '../../src/index.js';

class PostPolicy extends Policy {
  async update(user, post) {
    return user.id === post.authorId;
  }
}

test('Stage 3 - CookieJar HMAC signing and verification', () => {
  const jar = new CookieJar('test-secret');
  const cookieHeader = jar.make('session_token', 'xyz123');

  assert.match(cookieHeader, /session_token=xyz123\.[a-f0-9]{64}; Path=\/; Max-Age=86400; SameSite=Lax; HttpOnly/);
  const rawValue = 'xyz123';
  const signed = jar.sign(rawValue);
  assert.equal(jar.unsign(signed), 'xyz123');
  assert.equal(jar.unsign('invalid.signature'), null);
});

test('Stage 3 - SessionStore attribute and flash lifecycle', () => {
  const session = new SessionStore();
  session.put('user_id', 42);
  session.flash('message', 'Welcome back!');

  assert.equal(session.get('user_id'), 42);
  assert.equal(session.get('message'), 'Welcome back!');
  assert.equal(session.has('user_id'), true);
  session.forget('user_id');
  assert.equal(session.has('user_id'), false);
});

test('Stage 3 - Gate & Policy authorization', async () => {
  const gate = new Gate();
  gate.define('edit-settings', (user) => user.isAdmin);
  gate.policy(Object, new PostPolicy());

  const admin = { id: 1, isAdmin: true };
  const user = { id: 2, isAdmin: false };
  const post = { id: 10, authorId: 2 };

  assert.equal(await gate.allows('edit-settings', admin), true);
  assert.equal(await gate.allows('edit-settings', user), false);
  assert.equal(await gate.allows('update', user, post), true);
  assert.equal(await gate.allows('update', admin, post), false);
});

test('Stage 3 - ThrottleRequests middleware rate-limiting', async () => {
  const limiter = new RateLimiter();
  const middleware = new ThrottleRequests(limiter);

  const req = new NativeRequest({ url: '/api/resource', method: 'GET', headers: {} });

  const next = async () => new AbstractResponse().send('ok');

  // First call passes
  const res1 = await middleware.handle(req, next, 2, 1);
  assert.equal(res1.getHeader('X-RateLimit-Limit'), '2');
  assert.equal(res1.getHeader('X-RateLimit-Remaining'), '1');

  // Second call passes
  const res2 = await middleware.handle(req, next, 2, 1);
  assert.equal(res2.getHeader('X-RateLimit-Remaining'), '0');

  // Third call throws 429 RateLimitException
  await assert.rejects(async () => {
    await middleware.handle(req, next, 2, 1);
  }, RateLimitException);
});

test('Stage 3 - HttpCache ETag & 304 Not Modified response', async () => {
  const cache = new HttpCache();
  const reqInitial = new NativeRequest({ url: '/data', method: 'GET', headers: {} });
  const next = async () => new AbstractResponse().send('Hello World Payload');

  const res1 = await cache.handle(reqInitial, next);
  const etag = res1.getHeader('etag');
  assert.notEqual(etag, null);

  const reqCached = new NativeRequest({
    url: '/data',
    method: 'GET',
    headers: { 'if-none-match': etag }
  });
  const res2 = await cache.handle(reqCached, next);
  assert.equal(res2.getStatusCode(), 304);
  assert.equal(res2.content, '');
});
