import assert from 'node:assert/strict';

/**
 * Fluent Assertion Wrapper for HTTP Test Responses.
 */
export class TestResponse {
  /**
   * @param {import('../contracts/IResponse.js').IResponse} response
   */
  constructor(response) {
    this.response = response;
  }

  assertStatus(expectedCode) {
    assert.equal(
      this.response.getStatusCode(),
      expectedCode,
      `Expected status ${expectedCode}, got ${this.response.getStatusCode()}`
    );
    return this;
  }

  assertJson(expectedData) {
    let parsed;
    try {
      parsed = JSON.parse(this.response.content);
    } catch {
      assert.fail('Response content is not valid JSON');
    }
    assert.deepEqual(parsed, expectedData);
    return this;
  }

  assertHeader(name, expectedValue) {
    const val = this.response.getHeader(name);
    assert.equal(val, expectedValue, `Expected header ${name} to be ${expectedValue}, got ${val}`);
    return this;
  }

  assertRedirect(expectedUrl = null) {
    const status = this.response.getStatusCode();
    assert.ok(status >= 300 && status < 400, `Expected redirect status, got ${status}`);
    if (expectedUrl) {
      assert.equal(this.response.getHeader('location'), expectedUrl);
    }
    return this;
  }
}
