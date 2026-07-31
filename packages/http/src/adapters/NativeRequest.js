import { AbstractRequest } from '../foundation/AbstractRequest.js';
import { URL } from 'node:url';

/**
 * Native Node.js HTTP/HTTP2 Request Adapter.
 */
export class NativeRequest extends AbstractRequest {
  /**
   * @param {import('node:http').IncomingMessage} rawRequest
   */
  constructor(rawRequest) {
    super();
    this.raw = rawRequest;
    this.parsedUrl = new URL(rawRequest.url || '/', `http://${rawRequest.headers.host || 'localhost'}`);
    this.queryData = Object.fromEntries(this.parsedUrl.searchParams.entries());
    this.bodyData = rawRequest.body || null;
  }

  method() {
    return (this.raw.method || 'GET').toUpperCase();
  }

  path() {
    return this.parsedUrl.pathname;
  }

  url() {
    return this.raw.url;
  }

  ip() {
    return this.raw.socket?.remoteAddress || '127.0.0.1';
  }

  query(key = null, defaultValue = null) {
    if (key === null) return this.queryData;
    return Object.prototype.hasOwnProperty.call(this.queryData, key) ? this.queryData[key] : defaultValue;
  }

  input(key = null, defaultValue = null) {
    if (this.bodyData === null) {
      this.bodyData = this.raw.body || {};
    }
    if (key === null) return this.bodyData;
    return Object.prototype.hasOwnProperty.call(this.bodyData, key) ? this.bodyData[key] : defaultValue;
  }

  header(name = null, defaultValue = null) {
    if (name === null) return this.raw.headers;
    const lowerName = name.toLowerCase();
    return Object.prototype.hasOwnProperty.call(this.raw.headers, lowerName)
      ? this.raw.headers[lowerName]
      : defaultValue;
  }

  cookie(name = null, defaultValue = null) {
    const rawCookies = this.header('cookie', '');
    const cookies = {};
    if (rawCookies) {
      rawCookies.split(';').forEach(pair => {
        const parts = pair.split('=');
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        if (key) cookies[key] = decodeURIComponent(value);
      });
    }
    if (name === null) return cookies;
    return Object.prototype.hasOwnProperty.call(cookies, name) ? cookies[name] : defaultValue;
  }

  file(name = null) {
    const files = this.raw.files || this.filesData || {};
    if (name === null) return files;
    return Object.prototype.hasOwnProperty.call(files, name) ? files[name] : null;
  }
}
