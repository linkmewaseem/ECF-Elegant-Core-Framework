export class HttpCollector {
  collect(requestRecord, req, res) {
    if (!requestRecord || !req) return;

    const reqHeaders = req.headers ?? req.raw?.headers ?? {};
    let resHeaders = {};
    if (res) {
      if (typeof res.getHeaders === 'function') {
        resHeaders = res.getHeaders();
      } else if (res.raw && typeof res.raw.getHeaders === 'function') {
        resHeaders = res.raw.getHeaders();
      }
    }

    if (requestRecord.panels?.http) {
      requestRecord.panels.http.method = req.method ?? req.raw?.method ?? 'GET';
      requestRecord.panels.http.url = req.url ?? req.raw?.url ?? '/';
      requestRecord.panels.http.headers = reqHeaders;
      requestRecord.panels.http.responseHeaders = resHeaders;
      requestRecord.panels.http.ip = req.ip ?? req.socket?.remoteAddress ?? '127.0.0.1';
      if (res) {
        requestRecord.panels.http.status = res.statusCode ?? res.raw?.statusCode ?? 200;
      }
    }
  }
}

export default HttpCollector;
