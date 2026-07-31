import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../v1/full/bootstrap/app.js';
import { NativeRequest, AbstractResponse } from '../../http/src/index.js';

test('Milestone 11 - Skeleton full-stack bootstrapper and routing', async () => {
  const { router } = createApp();

  // 1. Health check route
  const reqHealth = new NativeRequest({ method: 'GET', url: '/health', headers: {} });
  const resHealth = new AbstractResponse();
  const routeHealth = router.match(reqHealth);
  const resultHealth = await routeHealth.action(reqHealth, resHealth);

  const payloadHealth = JSON.parse(resHealth.content);
  assert.equal(payloadHealth.status, 'healthy');
  assert.equal(payloadHealth.framework, 'ECF v1.0');

  // 2. Web Home Route (HomeController invocation)
  const reqHome = new NativeRequest({ method: 'GET', url: '/', headers: {} });
  const resHome = new AbstractResponse();
  const routeHome = router.match(reqHome);
  await routeHome.action(reqHome, resHome);

  const payloadHome = JSON.parse(resHome.content);
  assert.equal(payloadHome.message, 'Welcome to ECF Framework Enterprise App');

  // 3. API Status Route
  const reqApi = new NativeRequest({ method: 'GET', url: '/api/v1/status', headers: {} });
  const resApi = new AbstractResponse();
  const routeApi = router.match(reqApi);
  await routeApi.action(reqApi, resApi);

  const payloadApi = JSON.parse(resApi.content);
  assert.equal(payloadApi.status, 'ok');
  assert.equal(payloadApi.api, 'v1');
});
