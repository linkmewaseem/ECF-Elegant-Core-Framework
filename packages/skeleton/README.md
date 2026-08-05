# `@ecfjs/skeleton` — Application Scaffolding

`@ecfjs/skeleton` ECF projects ke liye **starting point** hai. Jab tum `ecf new my-app` chalate ho, `@ecfjs/cli` isi package ke andar se ek **blueprint** copy karta hai aur tumhara naya project bana deta hai — sahi folder structure, sahi imports, sahi providers, sab kuch already wired.

---

## Ye package kis kaam ka hai?

### Ye kya hai?

Socho tumhe ghar banana hai (naya ECF project). `@ecfjs/skeleton` uss ghar ka **pehle se bana hua naksha (blueprint)** hai — deewarein kahan hongi, bijli ki wiring kaise hogi, sab decide kiya hua. Tumhe sirf apna furniture (business logic) daalna hai.

### Iska maqsad kya hai?

Bina skeleton ke, har naye project ke liye tumhe khud se decide karna padega: providers kaise register hote hain, config files kaise likhte hain, folder structure kya ho. Ye time waste hai aur galtiyon ka chance zyada. Skeleton ye sab **ek dafa sahi tarike se** bana ke deta hai — taake har naya ECF project sahi foundation se shuru ho.

---

## Do Blueprints — Kyun?

Har project ki zaroorat alag hoti hai. Ek website jisme HTML pages dikhne hain (SSR), uski zaroorat alag hai us project se jo sirf mobile app ke liye JSON data deta hai (API). Isliye `@ecfjs/skeleton` **do alag blueprints** deta hai:

```
v1/
├── ssr/    ← HTML views wala project (views, sessions, cookies-based auth)
└── api/    ← Sirf JSON wala project (JWT auth, koi views nahi)
```

| | `v1/ssr` | `v1/api` |
|---|---|---|
| **Kab use karo** | Website, admin panel, koi bhi project jisme browser mein pages dikhne hain | Mobile app backend, microservice, koi bhi cheez jo sirf data deti ho |
| View Engine (`@ecfjs/view`) | ✅ hai | ❌ nahi hai |
| Auth default | Session (cookie-based) | JWT (token-based) |
| Primary routes | `routes/web.js` | `routes/api.js` |
| CORS middleware | Nahi (same-origin views) | ✅ by default lagi hai |

---

## Kaam Kaise Karta Hai

```bash
ecf new my-app --type=ssr    # ya --type=api
```

Jab ye command chalti hai:

1. `@ecfjs/cli`, `@ecfjs/skeleton` ke andar se sahi blueprint (`v1/ssr` ya `v1/api`) copy karta hai `my-app/` folder mein
2. `ecf.config.js` mein project ka naam set karta hai
3. `.env.example` ko `.env` bana ke basic values fill karta hai
4. `package.json` ke dependencies install karta hai

Bas — naya project ready, aur wo already `@ecfjs/http`, `@ecfjs/database` (postgres default), aur (agar SSR ho) `@ecfjs/view` ke saath wired hai.

---

## Har Blueprint Ke Andar Kya Hota Hai

```
v1/ssr/ (ya v1/api/)
├── app/
│   ├── Http/Controllers/   ← request handle karne wale
│   ├── Http/Middleware/    ← request/response ke beech chalne wala logic
│   ├── Http/Requests/      ← validation rules
│   ├── Models/             ← database tables ko represent karte hain
│   └── Providers/          ← tumhare khud ke service bindings
├── bootstrap/
│   ├── app.js              ← Application banata hai, providers register karta hai
│   └── providers.js        ← tumhare app-specific providers ki list
├── config/                 ← saari settings, .env se driven
├── database/migrations/    ← database schema ki history
├── public/index.js         ← HTTP server ka entrypoint (ye file directly run hoti hai)
├── routes/                 ← URL se controller tak ka mapping
└── ecf.config.js           ← project metadata (naam, blueprint type, packages)
```

**`bootstrap/app.js` vs `public/index.js` mein farq kyun hai?**

`bootstrap/app.js` sirf app ko **taiyar** karta hai (providers register, boot) — server start nahi karta. Ye isliye zaroori hai kyunki yehi function CLI commands, tests, aur queue workers mein bhi reuse hota hai — unhe HTTP server ki zaroorat nahi hoti. `public/index.js` sirf HTTP server start karne ke liye hai — ye alag file hai taake `createApp()` import karne se server accidentally start na ho jaye.

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — dependency rules aur package architecture

---

## License

MIT