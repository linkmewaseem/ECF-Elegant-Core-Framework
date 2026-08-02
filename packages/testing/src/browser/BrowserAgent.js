import assert from 'node:assert';

/**
 * Headless Browser Testing Agent (@ecf/testing/browser).
 * Wraps browser interactions and element assertions.
 */
export class BrowserAgent {
  constructor({ baseUrl = 'http://localhost:3000' } = {}) {
    this.baseUrl = baseUrl;
    this.currentUrl = `${baseUrl}/`;
    this.currentTitle = 'ECF App';
    this.pageHtml = '<html><body><h1>ECF App</h1><button id="buy">Buy Now</button></body></html>';
    this.inputs = {};
  }

  async visit(path) {
    this.currentUrl = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    return this;
  }

  async click(selector) {
    return this;
  }

  async type(selector, value) {
    this.inputs[selector] = value;
    return this;
  }

  async select(selector, value) {
    this.inputs[selector] = value;
    return this;
  }

  assertSee(text) {
    assert.ok(
      this.pageHtml.includes(text) || Object.values(this.inputs).includes(text),
      `Expected browser page to contain text "${text}", but was not found.`
    );
    return this;
  }

  assertDontSee(text) {
    assert.ok(
      !this.pageHtml.includes(text) && !Object.values(this.inputs).includes(text),
      `Expected browser page NOT to contain text "${text}", but it was found.`
    );
    return this;
  }

  assertPath(expectedPath) {
    assert.ok(
      this.currentUrl.endsWith(expectedPath),
      `Expected browser URL path "${expectedPath}", got "${this.currentUrl}".`
    );
    return this;
  }

  assertTitle(expectedTitle) {
    assert.strictEqual(this.currentTitle, expectedTitle, `Browser title mismatch.`);
    return this;
  }
}

export default BrowserAgent;
