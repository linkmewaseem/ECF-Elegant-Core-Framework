import http from 'node:http';
import { IHttpAdapter } from '../../contracts/IHttpAdapter.js';
import { NativeRequest } from '../NativeRequest.js';
import { AbstractResponse } from '../../foundation/AbstractResponse.js';

/**
 * Native Node.js http.Server adapter implementing IHttpAdapter.
 */
export class HttpAdapter extends IHttpAdapter {
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
      this.server = http.createServer(this.serverOptions, async (req, res) => {
        if (!this.requestHandler) {
          res.statusCode = 500;
          res.end('No request handler registered in HttpAdapter.');
          return;
        }

        const wrappedReq = new NativeRequest(req);
        const wrappedRes = new AbstractResponse();

        try {
          const result = await this.requestHandler(wrappedReq, wrappedRes);

          if (!res.headersSent) {
            // Apply status & headers
            res.statusCode = wrappedRes.getStatusCode();
            const headers = wrappedRes.getHeaders();
            for (const [key, value] of Object.entries(headers)) {
              res.setHeader(key, value);
            }

            // Apply cookies
            for (const [cookieName, cookieData] of wrappedRes.cookiesMap.entries()) {
              res.setHeader('Set-Cookie', `${cookieName}=${encodeURIComponent(cookieData.value)}`);
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
            res.end(`Internal Server Error: ${err.message}`);
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

  use(...args) {
    // Native node adapter placeholder for middleware plugins
  }

  getNativeServer() {
    return this.server;
  }
}
