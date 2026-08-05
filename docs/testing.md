# `@ecfjs/testing` — Enterprise Testing Platform Documentation

`@ecfjs/testing` is the official testing suite for ECF applications. It provides a native `node:test` wrapper with dependency-injected test context, app sandbox isolation, Playwright browser automation, RFC9457 HTTP assertions, database transaction rollbacks, model factories, mock clock time travel, snapshot testing, and unified subsystem fakes orchestration.

---

## 🚀 Quick Example

```js
import { test } from "@ecfjs/testing";

test("Complete User Registration & Order Checkout", async ({ app, http, database, time, fake, factory }) => {
  // 1. Enable subsystem fakes with one call
  fake.all();

  // 2. Mock time clock
  time.freeze("2026-08-03T00:00:00Z");

  // 3. Create Model Fixture via Factory
  const user = await factory(User).create({ name: "Jane Doe" });

  // 4. Perform HTTP Request with Impersonation
  const response = await http.actingAs(user).post("/api/orders", { amount: 150 });

  // 5. Response Assertions
  response.assertCreated();
  response.assertJson({ success: true, amount: 150 });

  // 6. Database Assertions
  database.assertDatabaseHas("orders", { user_id: user.id, amount: 150 });
});
```

---

## 🧪 Key Capabilities

### 1. HTTP Response Assertions
- Status shortcuts: `assertOk()`, `assertCreated()`, `assertNoContent()`, `assertUnauthorized()`, `assertForbidden()`, `assertNotFound()`, `assertConflict()`, `assertTooManyRequests()`.
- RFC9457 Problem Details: `assertProblem(type)`.
- JSON structure & data: `assertJson(data)`, `assertJsonStructure(keys)`, `assertJsonMissing(keys)`.

### 2. Database Sandbox Assertions
- `assertDatabaseHas(table, data)`
- `assertDatabaseMissing(table, data)`
- `assertDatabaseCount(table, count)`
- `assertSoftDeleted(table, data)`

### 3. Browser Automation (`@ecfjs/testing/browser`)
```js
import { BrowserAgent } from "@ecfjs/testing/browser";

test("Browser Checkout", async ({ browser }) => {
  await browser.visit("/checkout");
  await browser.type("#email", "admin@example.com");
  await browser.click("#buy");
  browser.assertSee("Order Created");
});
```

### 4. Benchmark Testing Engine
```js
test("Performance Benchmark", async ({ benchmark }) => {
  const result = await benchmark("Query Processing", async () => {
    // Operation to measure
  }, { iterations: 10000 });
});
```

---

## 📄 License
MIT Licensed.
