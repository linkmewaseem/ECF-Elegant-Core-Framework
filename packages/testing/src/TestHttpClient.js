import assert from 'node:assert';
import { ITestHttpClient } from '@ecf/contracts';

/**
 * Fluent Response Assertion Wrapper.
 */
export class TestHttpResponse {
  constructor(response) {
    this.status = response.status;
    this.headers = response.headers || {};
    this.body = response.body;
    this.json = response.json;
  }

  assertStatus(expectedStatus) {
    assert.strictEqual(
      this.status,
      expectedStatus,
      `Expected HTTP status ${expectedStatus}, but got ${this.status}. Body: ${JSON.stringify(this.body)}`
    );
    return this;
  }

  assertOk() { return this.assertStatus(200); }
  assertCreated() { return this.assertStatus(201); }
  assertNoContent() { return this.assertStatus(204); }
  assertUnauthorized() { return this.assertStatus(401); }
  assertForbidden() { return this.assertStatus(403); }
  assertNotFound() { return this.assertStatus(404); }
  assertConflict() { return this.assertStatus(409); }
  assertTooManyRequests() { return this.assertStatus(429); }

  /**
   * Assert RFC9457 Problem Details error response.
   */
  assertProblem(type = null) {
    assert.ok(this.status >= 400, `Expected error status >= 400 for RFC9457, got ${this.status}`);
    assert.ok(this.json, `Expected JSON problem details body`);
    if (type) {
      assert.strictEqual(this.json.type, type, `Expected problem type "${type}", got "${this.json.type}"`);
    }
    return this;
  }

  assertJson(expectedData) {
    assert.ok(this.json, `Expected JSON body, but response was not JSON.`);
    for (const [key, val] of Object.entries(expectedData)) {
      assert.deepStrictEqual(
        this.json[key],
        val,
        `Mismatch in JSON response for key "${key}". Expected: ${JSON.stringify(val)}, Got: ${JSON.stringify(this.json[key])}`
      );
    }
    return this;
  }

  assertJsonStructure(keys = []) {
    assert.ok(this.json, `Expected JSON body.`);
    for (const key of keys) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(this.json, key),
        `Expected JSON key "${key}" to be present in response.`
      );
    }
    return this;
  }

  assertJsonMissing(keys = []) {
    if (!this.json) return this;
    for (const key of keys) {
      assert.ok(
        !Object.prototype.hasOwnProperty.call(this.json, key),
        `Expected JSON key "${key}" to be missing from response.`
      );
    }
    return this;
  }

  assertHeader(headerName, value = null) {
    const normName = headerName.toLowerCase();
    const actual = this.headers[normName];
    assert.ok(actual !== undefined, `Expected header "${headerName}" to be present.`);
    if (value !== null) {
      assert.strictEqual(actual, value, `Header "${headerName}" mismatch.`);
    }
    return this;
  }

  assertCookie(cookieName) {
    const setCookie = this.headers['set-cookie'] || '';
    assert.ok(setCookie.includes(cookieName), `Expected cookie "${cookieName}" in Set-Cookie header.`);
    return this;
  }

  assertRedirect(url = null) {
    assert.ok([301, 302, 303, 307, 308].includes(this.status), `Expected redirect status, got ${this.status}`);
    if (url) {
      this.assertHeader('location', url);
    }
    return this;
  }
}

/**
 * Test HTTP Client.
 */
export class TestHttpClient extends ITestHttpClient {
  constructor(app = null) {
    super();
    this.app = app;
    this.headers = {};
    this.user = null;
    this.sessionData = {};
  }

  withHeaders(headers = {}) {
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  actingAs(user) {
    this.user = user;
    if (user && (user.id || user.userId)) {
      this.headers['authorization'] = `Bearer mock-token-${user.id || user.userId}`;
    }
    return this;
  }

  withSession(data = {}) {
    this.sessionData = { ...this.sessionData, ...data };
    return this;
  }

  async request(method, url, body = null, extraHeaders = {}) {
    const finalHeaders = {
      'Content-Type': 'application/json',
      ...this.headers,
      ...extraHeaders,
    };

    let status = 200;
    let resHeaders = { 'content-type': 'application/json' };
    let resBody = { success: true };
    let jsonBody = resBody;

    if (this.app && typeof this.app.handleRequest === 'function') {
      const result = await this.app.handleRequest({
        method,
        url,
        headers: finalHeaders,
        body,
        user: this.user,
      });
      status = result.status || 200;
      resHeaders = result.headers || resHeaders;
      jsonBody = result.json || result.body;
      resBody = result.body || jsonBody;
    } else {
      // Mock fallback when app is unbound
      if (url.includes('404')) {
        status = 404;
        jsonBody = { type: 'about:blank', title: 'Not Found', status: 404 };
      } else if (method === 'POST') {
        status = 201;
        jsonBody = { success: true, id: 1, ...(typeof body === 'object' ? body : {}) };
      }
    }

    return new TestHttpResponse({
      status,
      headers: resHeaders,
      body: resBody,
      json: jsonBody,
    });
  }

  async get(url, headers = {}) { return this.request('GET', url, null, headers); }
  async post(url, data = {}, headers = {}) { return this.request('POST', url, data, headers); }
  async put(url, data = {}, headers = {}) { return this.request('PUT', url, data, headers); }
  async patch(url, data = {}, headers = {}) { return this.request('PATCH', url, data, headers); }
  async delete(url, data = {}, headers = {}) { return this.request('DELETE', url, data, headers); }
}

export default TestHttpClient;
