import { IHttpAdapter } from '../../contracts/IHttpAdapter.js';
import { FastifyRequest } from '../FastifyRequest.js';
import { AbstractResponse } from '../../foundation/AbstractResponse.js';

/**
 * Fastify Server Adapter implementing IHttpAdapter.
 * Allows running ECF HTTP Kernel on top of Fastify.
 */
export class FastifyAdapter extends IHttpAdapter {
  constructor(fastifyInstance = null) {
    super();
    this.fastify = fastifyInstance;
    this.requestHandler = null;
    this.server = null;
  }

  onRequest(handler) {
    this.requestHandler = handler;
  }

  use(...args) {
    if (this.fastify && typeof this.fastify.register === 'function') {
      this.fastify.register(...args);
    }
  }

  async listen(port, host = '0.0.0.0', callback = null) {
    if (!this.fastify) {
      throw new Error('Fastify instance must be provided to FastifyAdapter.');
    }

    if (this.requestHandler) {
      this.fastify.all('*', async (req, reply) => {
        const wrappedReq = new FastifyRequest(req);
        const wrappedRes = new AbstractResponse();

        const result = await this.requestHandler(wrappedReq, wrappedRes);

        reply.code(wrappedRes.getStatusCode());
        const headers = wrappedRes.getHeaders();
        for (const [key, value] of Object.entries(headers)) {
          reply.header(key, value);
        }

        if (wrappedRes.content !== null) {
          return reply.send(wrappedRes.content);
        }
        return reply.send(result);
      });
    }

    const address = await this.fastify.listen({ port, host });
    this.server = this.fastify.server;
    if (callback) callback();
    return address;
  }

  async close(callback) {
    if (this.fastify) {
      await this.fastify.close();
    }
    if (callback) callback();
  }

  getNativeServer() {
    return this.server;
  }
}
