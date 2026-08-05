# ECF API Application

JSON-only ECF application — no views, JWT auth by default.

## Setup

```bash
cp .env.example .env
pnpm install
node public/index.js
```

## Structure

- `app/Http/Controllers/` — return JSON only (`res.json(...)`)
- `app/Http/Middleware/Cors.js` — CORS middleware, registered globally
- `config/auth.js` — JWT guard by default
- `routes/api.js` — all routes live here, versioned under `/api/v1`
- `public/index.js` — HTTP entrypoint
