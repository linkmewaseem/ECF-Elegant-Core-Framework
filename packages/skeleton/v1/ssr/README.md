# ECF SSR Application

Server-rendered ECF application — HTML views + session-based auth.

## Setup

```bash
cp .env.example .env
pnpm install
node public/index.js
```

## Structure

- `app/` — Controllers, Middleware, Models, Providers
- `config/` — all app configuration, driven by `.env`
- `resources/views/` — `.ecf` templates (Blade-style syntax)
- `routes/web.js` — page routes (returns views)
- `routes/api.js` — optional JSON routes for AJAX/webhooks
- `public/index.js` — HTTP entrypoint (what your process manager runs)
