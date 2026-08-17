import { createServer } from 'node:http';
import { DevToolsRouter } from './DevToolsRouter.js';

/**
 * DevToolsServer — Embedded zero-dependency HTTP server for the developer dashboard.
 */
export class DevToolsServer {
  #server = null;
  #router;
  #port;
  #host;
  #isListening = false;

  constructor(store, { port = 8787, host = '127.0.0.1' } = {}) {
    this.#router = new DevToolsRouter(store);
    this.#port = port;
    this.#host = host;
  }

  start(port = this.#port, host = this.#host) {
    if (this.#isListening) return Promise.resolve(this.getUrl());

    this.#port = port;
    this.#host = host;

    return new Promise((resolve, reject) => {
      this.#server = createServer((req, res) => this.#router.handle(req, res));

      this.#server.on('error', (err) => {
        this.#isListening = false;
        reject(err);
      });

      this.#server.listen(this.#port, this.#host, () => {
        this.#isListening = true;
        const addr = this.#server.address();
        if (addr && typeof addr === "object") {
          this.#port = addr.port;
        }
        resolve(this.getUrl());
      });
    });
  }

  stop() {
    if (!this.#server || !this.#isListening) return Promise.resolve();

    return new Promise((resolve, reject) => {
      if (typeof this.#server.closeAllConnections === "function") {
        this.#server.closeAllConnections();
      }
      this.#server.close((err) => {
        this.#isListening = false;
        if (err) reject(err);
        else resolve();
      });
    });
  }

  getUrl() {
    return `http://${this.#host}:${this.#port}`;
  }

  isListening() {
    return this.#isListening;
  }
}

export default DevToolsServer;
