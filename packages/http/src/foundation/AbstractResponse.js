import { IResponse } from '../contracts/IResponse.js';

/**
 * Base Abstract Response builder.
 * Provides fluid status, header, cookie, and serialization logic across runtimes.
 */
export class AbstractResponse extends IResponse {
  constructor() {
    super();
    this.statusCode = 200;
    this.headersMap = new Map();
    this.cookiesMap = new Map();
    this.content = null;
    this.isSentFlag = false;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  getStatusCode() {
    return this.statusCode;
  }

  header(name, value) {
    if (value === undefined) {
      return this.getHeader(name);
    }
    this.headersMap.set(name.toLowerCase(), { originalName: name, value: String(value) });
    return this;
  }

  getHeader(name) {
    const entry = this.headersMap.get(name.toLowerCase());
    return entry ? entry.value : null;
  }

  getHeaders() {
    const result = {};
    for (const entry of this.headersMap.values()) {
      result[entry.originalName] = entry.value;
    }
    return result;
  }

  cookie(name, value, options = {}) {
    this.cookiesMap.set(name, { value, options });
    return this;
  }

  json(data) {
    this.header('Content-Type', 'application/json; charset=utf-8');
    this.content = JSON.stringify(data);
    return this;
  }

  html(content) {
    this.header('Content-Type', 'text/html; charset=utf-8');
    this.content = content;
    return this;
  }

  redirect(url, status = 302) {
    this.status(status);
    this.header('Location', url);
    this.content = `Redirecting to ${url}`;
    return this;
  }

  send(body) {
    this.content = body;
    return this;
  }

  isSent() {
    return this.isSentFlag;
  }
}
