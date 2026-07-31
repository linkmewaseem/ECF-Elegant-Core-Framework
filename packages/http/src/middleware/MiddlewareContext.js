/**
 * Encapsulates contextual request/response state passed through the middleware pipeline.
 */
export class MiddlewareContext {
  /**
   * @param {import('../contracts/IRequest.js').IRequest} request
   * @param {import('../contracts/IResponse.js').IResponse} response
   */
  constructor(request, response) {
    this.request = request;
    this.response = response;
    this.metadata = new Map();
  }

  set(key, value) {
    this.metadata.set(key, value);
    return this;
  }

  get(key, defaultValue = null) {
    return this.metadata.has(key) ? this.metadata.get(key) : defaultValue;
  }
}
