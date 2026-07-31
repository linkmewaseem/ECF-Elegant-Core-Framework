/**
 * Abstract contract for HTTP server adapters.
 * Controls server lifecycle and request binding across runtimes (Node http/http2, Express, Fastify).
 *
 * @interface IHttpAdapter
 */
export class IHttpAdapter {
  /**
   * Start listening on specified port/host.
   * @param {number} port
   * @param {string} [host]
   * @param {Function} [callback]
   * @returns {Promise<void>|void}
   */
  listen(port, host, callback) {
    throw new Error('Method listen() must be implemented.');
  }

  /**
   * Close the running HTTP server.
   * @param {Function} [callback]
   * @returns {Promise<void>|void}
   */
  close(callback) {
    throw new Error('Method close() must be implemented.');
  }

  /**
   * Register a request handler callback with the adapter.
   * @param {Function} handler Function(request: IRequest, response: IResponse)
   */
  onRequest(handler) {
    throw new Error('Method onRequest() must be implemented.');
  }

  /**
   * Register a runtime-level middleware or plugin.
   * @param {...any} args
   */
  use(...args) {
    throw new Error('Method use() must be implemented.');
  }

  /**
   * Get the underlying native server instance (e.g. http.Server).
   * @returns {any}
   */
  getNativeServer() {
    throw new Error('Method getNativeServer() must be implemented.');
  }
}
