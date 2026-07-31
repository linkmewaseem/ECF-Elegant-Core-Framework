import { NativeRequest } from '../adapters/NativeRequest.js';
import { AbstractResponse } from '../foundation/AbstractResponse.js';
import { TestResponse } from './TestResponse.js';

/**
 * Fluent HTTP Test Client.
 */
export class HttpTestCase {
  /**
   * @param {Function} appHandler Function(request, response)
   */
  constructor(appHandler) {
    this.handler = appHandler;
  }

  static create(appHandler) {
    return new this(appHandler);
  }

  async call(method, url, body = null, headers = {}) {
    const fakeReq = new NativeRequest({
      method: method.toUpperCase(),
      url,
      headers,
      body
    });
    const fakeRes = new AbstractResponse();

    const result = await this.handler(fakeReq, fakeRes);
    if (result !== undefined && fakeRes.content === null) {
      if (typeof result === 'object') {
        fakeRes.json(result);
      } else {
        fakeRes.send(String(result));
      }
    }

    return new TestResponse(fakeRes);
  }

  get(url, headers = {}) {
    return this.call('GET', url, null, headers);
  }

  post(url, body = null, headers = {}) {
    return this.call('POST', url, body, headers);
  }

  put(url, body = null, headers = {}) {
    return this.call('PUT', url, body, headers);
  }

  delete(url, headers = {}) {
    return this.call('DELETE', url, null, headers);
  }
}
