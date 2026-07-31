import http2 from 'node:http2';
import { IHttpAdapter } from '../../contracts/IHttpAdapter.js';
import { NativeRequest } from '../NativeRequest.js';
import { AbstractResponse } from '../../foundation/AbstractResponse.js';

/**
 * Native Node.js http2.Server adapter implementing IHttpAdapter.
 */
export class Http2Adapter extends IHttpAdapter {
  constructor(serverOptions = {}) {
    super();
    this.serverOptions = serverOptions;
    this.requestHandler = null;
    this.server = null;
  }

  onRequest(handler) {
    this.requestHandler = handler;
  }

  listen(port, host = '0.0.0.0', callback = null) {
    if (!this.server) {
      const createFn = this.serverOptions.key && this.serverOptions.cert
        ? http2.createSecureServer
        : http2.createServer;

      this.server = createFn(this.serverOptions, async (req, res) => {
        if (!this.requestHandler) {
          res.statusCode = 500;
          res.end('No request handler registered in Http2Adapter.');
          return;
        }

        const wrappedReq = new NativeRequest(req);
        const wrappedRes = new AbstractResponse();

        try {
          const result = await this.requestHandler(wrappedReq, wrappedRes);

          if (!res.headersSent) {
            res.statusCode = wrappedRes.getStatusCode();
            const headers = wrappedRes.getHeaders();
            for (const [key, value] of Object.entries(headers)) {
              res.setHeader(key, value);
            }

            if (result !== undefined && wrappedRes.content === null) {
              if (typeof result === 'object') {
                wrappedRes.json(result);
              } else {
                wrappedRes.send(String(result));
              }
            }

            res.end(wrappedRes.content !== null ? wrappedRes.content : '');
          }
        } catch (err) {
          if (!res.headersSent) {
            res.statusCode = 500;
            res.end(`HTTP/2 Internal Error: ${err.message}`);
          }
        }
      });
    }

    return new Promise((resolve) => {
      this.server.listen(port, host, () => {
        if (callback) callback();
        resolve(this.server);
      });
    });
  }

  close(callback) {
    if (!this.server) {
      if (callback) callback();
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (callback) callback(err);
        if (err) reject(err);
        else resolve();
      });
    });
  }

  use(...args) {}

  getNativeServer() {
    return this.server;
  }
}
