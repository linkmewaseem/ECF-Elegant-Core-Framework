import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  IHttpAdapter, IRequest, IResponse, AbstractRequest, AbstractResponse,
  NativeRequest, ExpressRequest, FastifyRequest, HttpAdapter
} from '../../src/index.js';

test('Stage 1 - Abstract Contracts threw unimplemented errors if not extended', () => {
  const adapter = new IHttpAdapter();
  assert.throws(() => adapter.listen(8080), /Method listen\(\) must be implemented/);
  assert.throws(() => adapter.close(), /Method close\(\) must be implemented/);

  const request = new IRequest();
  assert.throws(() => request.method(), /Method method\(\) must be implemented/);

  const response = new IResponse();
  assert.throws(() => response.status(200), /Method status\(\) must be implemented/);
});

test('Stage 1 - NativeRequest normalizes incoming HTTP request', () => {
  const fakeIncomingMessage = {
    method: 'POST',
    url: '/api/v1/users?page=2',
    headers: {
      host: 'localhost:3000',
      accept: 'application/json',
      cookie: 'session_id=12345; theme=dark'
    },
    body: { name: 'Alice' }
  };

  const req = new NativeRequest(fakeIncomingMessage);
  assert.equal(req.method(), 'POST');
  assert.equal(req.path(), '/api/v1/users');
  assert.equal(req.query('page'), '2');
  assert.equal(req.input('name'), 'Alice');
  assert.equal(req.cookie('session_id'), '12345');
  assert.equal(req.cookie('theme'), 'dark');
  assert.equal(req.wantsJson(), true);
});

test('Stage 1 - ExpressRequest & FastifyRequest normalize request attributes', () => {
  const expressReq = new ExpressRequest({
    method: 'GET',
    path: '/posts',
    query: { filter: 'active' },
    get: (h) => h === 'accept' ? 'text/html' : null
  });
  assert.equal(expressReq.method(), 'GET');
  assert.equal(expressReq.query('filter'), 'active');
  assert.equal(expressReq.wantsJson(), false);

  const fastifyReq = new FastifyRequest({
    method: 'DELETE',
    url: '/posts/42',
    headers: { accept: 'application/json' },
    params: { id: '42' }
  });
  assert.equal(fastifyReq.method(), 'DELETE');
  assert.equal(fastifyReq.wantsJson(), true);
});

test('Stage 1 - AbstractResponse fluid response builder', () => {
  const res = new AbstractResponse();
  res.status(201).header('X-Framework', 'ECF').json({ success: true });

  assert.equal(res.getStatusCode(), 201);
  assert.equal(res.getHeader('x-framework'), 'ECF');
  assert.equal(res.content, JSON.stringify({ success: true }));
});
