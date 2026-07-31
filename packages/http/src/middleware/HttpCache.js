import crypto from 'node:crypto';

/**
 * ETag & Conditional Request Middleware.
 * Returns 304 Not Modified when client ETag match is fresh.
 */
export class HttpCache {
  async handle(request, next, cacheControlDirectives = 'public, max-age=3600') {
    const response = await next(request);

    if (!response || response.getStatusCode() !== 200 || !response.content) {
      return response;
    }

    // Compute SHA-256 ETag hash
    const etag = `"${crypto.createHash('sha256').update(response.content).digest('hex').slice(0, 16)}"`;
    response.header('ETag', etag);
    response.header('Cache-Control', cacheControlDirectives);

    const clientETag = request.header('if-none-match');
    if (clientETag && clientETag === etag) {
      response.status(304);
      response.send('');
    }

    return response;
  }
}
