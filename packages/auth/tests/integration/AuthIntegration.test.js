import test from "node:test";
import assert from "node:assert/strict";
import { Application } from "../../../core/src/index.js";
import AuthServiceProvider from "../../src/providers/AuthServiceProvider.js";
import AuthFacade from "../../src/facades/AuthFacade.js";
import GateFacade from "../../src/facades/GateFacade.js";
import GateBridge from "../../../http/src/auth/Gate.js";

test("AuthIntegration - AuthServiceProvider and Facades in ECF Application Container", async () => {
  const app = new Application();
  app.register(AuthServiceProvider);
  app.boot();

  assert.ok(app.make("auth"));
  assert.ok(app.make("gate"));
  assert.ok(app.make("auth.hasher"));

  // Bind Facade
  AuthFacade.setApplication(app);
  GateFacade.setApplication(app);

  const hasher = app.make("auth.hasher");
  const hash = await hasher.make("Secret123");
  assert.ok(hash.startsWith("$ecf$"));

  // Check HTTP Gate bridge delegating to @ecfjs/auth
  const httpGate = new GateBridge();
  httpGate.define("view-dashboard", (user) => user && user.role === "admin");

  assert.equal(await httpGate.allows("view-dashboard", { role: "admin" }), true);
  assert.equal(await httpGate.allows("view-dashboard", { role: "guest" }), false);
});
