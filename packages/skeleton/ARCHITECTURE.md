# @ecf/skeleton — Package Architecture

`@ecf/skeleton` project scaffolding ke liye source-of-truth hai. Ye khud ek runnable package nahi hai (koi exported class/function nahi deta) — ye sirf **blueprint templates** ka collection hai jo `@ecf/cli` copy karke naya project banata hai.

---

## Core Components

- **Blueprints (`v1/ssr`, `v1/api`)** — do complete, working ECF project templates. Har ek apne aap mein valid, runnable project hai (agar isolate karke `pnpm install` karo, chal jayega).
- **`ecf.config.js` per blueprint** — project metadata jo `@ecf/cli` aur `@ecf/devkit` (jaise `ecf doctor`) read karte hain: project naam, blueprint type, declared packages, custom paths.
- **Integration Tests (`tests/SkeletonIntegration.test.js`)** — verify karta hai ke har blueprint boot ho sakta hai bina crash kiye (providers sahi register hote hain, routes sahi register hoti hain).

---

## Blueprint Design Rules

Ye rules dono blueprints (aur future kisi bhi naye blueprint) pe apply hote hain:

1. **Sirf `@ecf/*` package imports use hongi.** Kabhi bhi relative path se doosre package ke `src/` folder mein import mat karo (jaise `'../../../../core/src/index.js'`). Blueprint monorepo se **bahar copy hoke chalna chahiye** — relative monorepo paths isko tod dete hain.

2. **Har blueprint apne relevant Service Providers khud register kare** `bootstrap/app.js` mein. Koi bhi provider "chup-chaap kaam kar raha hai" assume mat karo — agar `@ecf/view` use ho raha hai to `ViewServiceProvider` explicitly register hona chahiye.

3. **Routes files sirf ek registration function export karengi**, top-level pe `Route.*` call nahi karengi. Wajah: `Facade.setApplication(app)` `app.boot()` ke baad chalta hai — agar route file import hote hi `Route.get(...)` chala de, aur wo import `Facade.setApplication` se pehle hua ho, to crash hoga. Isliye:
   ```javascript
   // ✅ Sahi — function export, call baad mein hota hai
   export default function registerWebRoutes() {
       Route.get("/", handler);
   }
   ```

4. **`config/*.js` files sirf wahi keys use karengi jo actual package padhta hai.** Config file banane se pehle relevant `ServiceProvider` check karo ke wo kaunsi `config.get("x.y")` keys call kar raha hai — mismatch (jaise `view.paths` array likhna jab package `view.path` string expect kare) silently fail ho jata hai, koi error nahi deta.

5. **Database default `postgres` hai**, `sqlite`/`mysql` options ke saath — ECF ka primary supported production driver.

6. **`public/index.js` hi sirf `app.listen()` call karega.** `bootstrap/app.js` kabhi server start nahi karega — sirf app taiyar karega. Isse `createApp()` CLI, tests, aur background workers mein bina side-effect ke reuse ho sakta hai.

---

## Dependencies

Har blueprint apni zaroorat ke hisaab se ye packages declare karta hai (`ecf.config.js` → `packages` array, aur `package.json`):

| Package | `v1/ssr` | `v1/api` |
|---|---|---|
| `@ecf/core` | ✅ | ✅ |
| `@ecf/http` | ✅ | ✅ |
| `@ecf/database` | ✅ | ✅ |
| `@ecf/auth` | ✅ (session guard) | ✅ (JWT guard) |
| `@ecf/validation` | ✅ | ✅ |
| `@ecf/view` | ✅ | ❌ |

---

## Dependency Rules

- Skeleton ek **consumer package** hai — ise koi core infrastructure package (`@ecf/core`, `@ecf/http`, wagera) import nahi karega. Dependency direction hamesha ek-tarfa hai: skeleton → framework packages, kabhi ulta nahi.
- Skeleton khud koi naya framework behavior implement nahi karta — ye sirf existing packages ko **sahi order mein wire** karta hai. Agar koi naya feature chahiye (jaise naya middleware type), wo uske apne package mein jayega, skeleton mein nahi.
- Blueprints ek doosre se independent hain — `v1/api` mein koi change `v1/ssr` ko break nahi karna chahiye aur vice versa. Shared logic (jaise dono mein common controller pattern) copy-paste hoga, import nahi — taake har blueprint apne aap mein standalone rahe.

---

## Future Blueprints

Naya blueprint add karne ke liye (jaise `v1/graphql` ya `v1/cli-tool`):

1. `v1/<name>/` folder banao, upar diye "Blueprint Design Rules" follow karte hue
2. `ecf.config.js` mein `blueprint: 'v1/<name>'` set karo
3. `tests/SkeletonIntegration.test.js` mein ek boot-test add karo
4. `@ecf/cli`'s `ecf new --type=<name>` mein wire karo