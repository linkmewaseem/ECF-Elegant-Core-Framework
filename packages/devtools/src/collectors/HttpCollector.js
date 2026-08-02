export class HttpCollector {
  collect(requestRecord, req, res) {
    if (!requestRecord || !req) return;

    requestRecord.panels.http.method = req.method ?? 'GET';
    requestRecord.panels.http.url = req.url ?? '/';
    requestRecord.panels.http.headers = req.headers ?? {};
    requestRecord.panels.http.ip = req.ip ?? req.socket?.remoteAddress ?? '127.0.0.1';

    if (res) {
      requestRecord.panels.http.status = res.statusCode ?? 200;
    }
  }
}

export default HttpCollector;
