import { AbstractRequest } from '../foundation/AbstractRequest.js';

/**
 * Fastify Request Adapter.
 */
export class FastifyRequest extends AbstractRequest {
  constructor(fastifyReq) {
    super();
    this.raw = fastifyReq;
    this.queryData = fastifyReq.query || {};
    this.bodyData = fastifyReq.body || {};
    this.params = fastifyReq.params || {};
  }

  method() {
    return (this.raw.method || 'GET').toUpperCase();
  }

  path() {
    return this.raw.routerPath || this.raw.url;
  }

  url() {
    return this.raw.url;
  }

  ip() {
    return this.raw.ip || '127.0.0.1';
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
    const lowerName = name.toLowerCase();
    return Object.prototype.hasOwnProperty.call(this.raw.headers, lowerName)
      ? this.raw.headers[lowerName]
      : defaultValue;
  }

  cookie(name = null, defaultValue = null) {
    const cookies = this.raw.cookies || {};
    if (name === null) return cookies;
    return Object.prototype.hasOwnProperty.call(cookies, name) ? cookies[name] : defaultValue;
  }

  file(name = null) {
    const files = this.raw.files || {};
    if (name === null) return files;
    return Object.prototype.hasOwnProperty.call(files, name) ? files[name] : null;
  }
}
