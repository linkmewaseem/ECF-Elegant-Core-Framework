import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DASHBOARD_PATH = join(__dirname, '../ui/dashboard.html');

export class DevToolsRouter {
  #store;
  #dashboardHtml = null;

  constructor(store) {
    this.#store = store;
  }

  getDashboardHtml() {
    if (!this.#dashboardHtml) {
      try {
        this.#dashboardHtml = readFileSync(DASHBOARD_PATH, 'utf-8');
      } catch (err) {
        this.#dashboardHtml = `<!DOCTYPE html><html><body><h1>DevTools Dashboard</h1><p>Dashboard UI template loading error: ${err.message}</p></body></html>`;
      }
    }
    return this.#dashboardHtml;
  }

  handle(req, res) {
    const urlObj = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
    const pathname = urlObj.pathname;
    const method = req.method.toUpperCase();

    // CORS headers for local dev server
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (pathname === '/' || pathname === '/dashboard') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(this.getDashboardHtml());
      return;
    }

    if (pathname === '/api/entries' && method === 'GET') {
      const search = urlObj.searchParams.get('search');
      const status = urlObj.searchParams.get('status');
      const reqMethod = urlObj.searchParams.get('method');
      const panel = urlObj.searchParams.get('panel');
      const limit = Number(urlObj.searchParams.get('limit') ?? 100);

      const entries = this.#store.find({ search, status, method: reqMethod, panel, limit });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(entries));
      return;
    }

    if (pathname.startsWith('/api/entries/') && method === 'GET') {
      const id = pathname.replace('/api/entries/', '');
      const record = this.#store.get(id);

      if (!record) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Entry not found' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(record));
      return;
    }

    if (pathname === '/api/clear' && method === 'POST') {
      this.#store.clear();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'DevTools entry store cleared' }));
      return;
    }

    if (pathname === '/api/stats' && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(this.#store.stats()));
      return;
    }

    if (pathname === '/api/health' && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: 'ok',
          uptimeSec: Math.floor(process.uptime()),
          totalEntries: this.#store.count,
          capacity: this.#store.capacity,
        })
      );
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
}

export default DevToolsRouter;
