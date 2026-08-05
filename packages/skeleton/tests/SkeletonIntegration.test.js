import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp as createSsrApp } from '../v1/ssr/bootstrap/app.js';
import { createApp as createApiApp } from '../v1/api/bootstrap/app.js';
import { NativeRequest, AbstractResponse } from '@ecf/http';

test('Skeleton SSR Blueprint Integration Test', async () => {
  const app = createSsrApp();
  const router = app.make('router');

  // 1. Health check route
  const reqHealth = new NativeRequest({ method: 'GET', url: '/health', headers: {} });
  const resHealth = new AbstractResponse();
  const routeHealth = router.match(reqHealth);
  await routeHealth.action(reqHealth, resHealth);

  const payloadHealth = JSON.parse(resHealth.content);
  assert.equal(payloadHealth.status, 'healthy');

  // 2. Web Home Route (HomeController SSR View invocation)
  const reqHome = new NativeRequest({ method: 'GET', url: '/', headers: {} });
  const resHome = new AbstractResponse();
  const routeHome = router.match(reqHome);
  await routeHome.action(reqHome, resHome);

  assert.match(resHome.content, /Welcome/);
  assert.equal(resHome.getHeader('Content-Type'), 'text/html; charset=utf-8');

  // 3. API Status Route (/api/v1/status)
  const reqApi = new NativeRequest({ method: 'GET', url: '/api/v1/status', headers: {} });
  const resApi = new AbstractResponse();
  const routeApi = router.match(reqApi);
  await routeApi.action(reqApi, resApi);

  const payloadApi = JSON.parse(resApi.content);
  assert.equal(payloadApi.status, 'ok');
  assert.equal(payloadApi.api, 'v1');
});

test('Skeleton API Blueprint Integration Test', async () => {
  const app = createApiApp();
  const router = app.make('router');

  // 1. Health check route
  const reqHealth = new NativeRequest({ method: 'GET', url: '/health', headers: {} });
  const resHealth = new AbstractResponse();
  const routeHealth = router.match(reqHealth);
  await routeHealth.action(reqHealth, resHealth);

  const payloadHealth = JSON.parse(resHealth.content);
  assert.equal(payloadHealth.status, 'healthy');

  // 2. API Status Route (/api/v1/status)
  const reqApi = new NativeRequest({ method: 'GET', url: '/api/v1/status', headers: {} });
  const resApi = new AbstractResponse();
  const routeApi = router.match(reqApi);
  await routeApi.action(reqApi, resApi);

  const payloadApi = JSON.parse(resApi.content);
  assert.equal(payloadApi.status, 'ok');
  assert.equal(payloadApi.api, 'v1');
});


