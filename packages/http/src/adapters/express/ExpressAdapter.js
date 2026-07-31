import { IHttpAdapter } from '../../contracts/IHttpAdapter.js';
import { ExpressRequest } from '../ExpressRequest.js';
import { AbstractResponse } from '../../foundation/AbstractResponse.js';

/**
 * Express Server Adapter implementing IHttpAdapter.
 * Allows running ECF HTTP Kernel on top of Express.
 */
export class ExpressAdapter extends IHttpAdapter {
  constructor(expressApp = null) {
    super();
    this.app = expressApp;
    this.requestHandler = null;
    this.server = null;
  }

  onRequest(handler) {
    this.requestHandler = handler;
  }

  use(...args) {
    if (this.app && typeof this.app.use === 'function') {
      this.app.use(...args);
    }
  }

  listen(port, host = '0.0.0.0', callback = null) {
    if (!this.app) {
      throw new Error('Express app instance must be provided to ExpressAdapter.');
    }

    if (this.requestHandler) {
      this.app.use(async (req, res, next) => {
        const wrappedReq = new ExpressRequest(req);
        const wrappedRes = new AbstractResponse();

        try {
          const result = await this.requestHandler(wrappedReq, wrappedRes);

          if (wrappedRes.content !== null || res.headersSent) {
            res.status(wrappedRes.getStatusCode());
            const headers = wrappedRes.getHeaders();
            for (const [key, value] of Object.entries(headers)) {
              res.setHeader(key, value);
            }
            res.send(wrappedRes.content);
          } else if (result !== undefined) {
            res.send(result);
          } else {
            next();
          }
        } catch (err) {
          next(err);
        }
      });
    }

    return new Promise((resolve) => {
      this.server = this.app.listen(port, host, () => {
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

  getNativeServer() {
    return this.server;
  }
}
