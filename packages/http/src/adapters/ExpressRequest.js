import { AbstractRequest } from '../foundation/AbstractRequest.js';

/**
 * Express Request Adapter.
 */
export class ExpressRequest extends AbstractRequest {
  constructor(expressReq) {
    super();
    this.raw = expressReq;
    this.queryData = expressReq.query || {};
    this.bodyData = expressReq.body || {};
    this.filesData = expressReq.files || {};
    this.params = expressReq.params || {};
  }

  method() {
    return (this.raw.method || 'GET').toUpperCase();
  }

  path() {
    return this.raw.path || this.raw.baseUrl + this.raw.path;
  }

  url() {
    return this.raw.originalUrl || this.raw.url;
  }

  ip() {
    return this.raw.ip || this.raw.socket?.remoteAddress || '127.0.0.1';
  }

  query(key = null, defaultValue = null) {
    if (key === null) return this.queryData;
    return Object.prototype.hasOwnProperty.call(this.queryData, key) ? this.queryData[key] : defaultValue;
  }

  input(key = null, defaultValue = null) {
    if (key === null) return this.bodyData;
    return Object.prototype.hasOwnProperty.call(this.bodyData, key) ? this.bodyData[key] : defaultValue;
  }

  header(name = null, defaultValue = null) {
    if (name === null) return this.raw.headers;
    return this.raw.get(name) || defaultValue;
  }

  cookie(name = null, defaultValue = null) {
    const cookies = this.raw.cookies || {};
    if (name === null) return cookies;
    return Object.prototype.hasOwnProperty.call(cookies, name) ? cookies[name] : defaultValue;
  }

  file(name = null) {
    if (name === null) return this.filesData;
    return Object.prototype.hasOwnProperty.call(this.filesData, name) ? this.filesData[name] : null;
  }
}
