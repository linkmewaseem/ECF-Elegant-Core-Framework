import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HttpTestCase, ContentNegotiation, Router, NativeRequest, AbstractResponse
} from '../../src/index.js';

test('Stage 4 - ContentNegotiation parses Accept headers', () => {
  const reqJson = new NativeRequest({ method: 'GET', url: '/', headers: { accept: 'application/json' } });
  const negJson = new ContentNegotiation(reqJson);
  assert.equal(negJson.wantsJson(), true);
  assert.equal(negJson.negotiate(['json', 'html']), 'json');

  const reqHtml = new NativeRequest({ method: 'GET', url: '/', headers: { accept: 'text/html' } });
  const negHtml = new ContentNegotiation(reqHtml);
  assert.equal(negHtml.acceptsHtml(), true);
  assert.equal(negHtml.negotiate(['json', 'html']), 'html');
});

test('Stage 4 - HttpTestCase fluent assertions client', async () => {
  const router = new Router();
  router.get('/api/health', (req, res) => {
    return res.status(200).header('x-app', 'ECF').json({ status: 'ok' });
  });

  router.get('/old-page', (req, res) => {
    return res.redirect('/new-page', 301);
  });

  const appHandler = async (req, res) => {
    const route = router.match(req);
    return route.action(req, res);
  };

  const testClient = HttpTestCase.create(appHandler);

  const res1 = await testClient.get('/api/health');
  res1.assertStatus(200);
  res1.assertHeader('x-app', 'ECF');
  res1.assertJson({ status: 'ok' });

  const res2 = await testClient.get('/old-page');
  res2.assertRedirect('/new-page');
});
