import test from "node:test";
import assert from "node:assert/strict";
import { Application } from "../../../core/src/index.js";
import { AuthServiceProvider, Auth, Gate } from "../../src/index.js";
import createAuthMiddleware from "../../src/integrations/http/AuthMiddleware.js";
import createGuestMiddleware from "../../src/integrations/http/GuestMiddleware.js";
import {
  createVerifiedMiddleware,
  createSignedUrlMiddleware,
  createCanMiddleware,
  createRoleMiddleware,
  createPermissionMiddleware
} from "../../src/integrations/http/HttpMiddlewareAdapters.js";
import SignedUrlGuard from "../../src/authentication/guards/SignedUrlGuard.js";
import SessionGuard from "../../src/authentication/guards/SessionGuard.js";
import MemoryUserProvider from "../../src/authentication/providers/MemoryUserProvider.js";
import SessionManager from "../../src/authentication/sessions/SessionManager.js";
import PermissionResolver from "../../src/authorization/PermissionResolver.js";
import { AuthenticationException, AuthorizationException, AuthException } from "../../src/exceptions/AuthException.js";

test("AuthHttpIntegration - AuthMiddleware allows authenticated request and blocks guest", async () => {
  const app = new Application();
  app.register(AuthServiceProvider);
  app.boot();

  const provider = new MemoryUserProvider([{ id: 42, username: "dev" }]);
  const sessionManager = new SessionManager();
  const sessionGuard = new SessionGuard("session", provider, sessionManager);

  const guardManager = app.make("auth.guard_manager");
  guardManager.registerGuard("session", sessionGuard);

  const authManager = app.make("auth");

  const authMiddleware = createAuthMiddleware(authManager);
  const guestMiddleware = createGuestMiddleware(authManager);

  // 1. Unauthenticated request -> AuthMiddleware throws AuthenticationException
  let nextCalled = false;
  await assert.rejects(async () => {
    await authMiddleware({}, async () => { nextCalled = true; });
  }, AuthenticationException);
  assert.equal(nextCalled, false);

  // 2. Unauthenticated request -> GuestMiddleware passes
  let guestNextCalled = false;
  await guestMiddleware({}, async () => { guestNextCalled = true; });
  assert.equal(guestNextCalled, true);

  // 3. Login user -> AuthMiddleware passes
  const user = { id: 42, username: "dev" };
  sessionGuard.setUser(user);

  let authNextCalled = false;
  await authMiddleware({}, async () => { authNextCalled = true; });
  assert.equal(authNextCalled, true);

  // 4. Authenticated user -> GuestMiddleware rejects
  await assert.rejects(async () => {
    await guestMiddleware({}, async () => {});
  }, AuthException);
});

test("AuthHttpIntegration - Verified, SignedUrl, Can, Role, and Permission middlewares", async () => {
  const signer = new SignedUrlGuard("test-secret");
  const verifiedMiddleware = createVerifiedMiddleware({ user: async () => ({ id: 1, email_verified_at: "2026-01-01" }) });
  const unverifiedMiddleware = createVerifiedMiddleware({ user: async () => ({ id: 2, email_verified_at: null }) });

  let vNext = false;
  await verifiedMiddleware({}, async () => { vNext = true; });
  assert.equal(vNext, true);

  await assert.rejects(async () => {
    await unverifiedMiddleware({}, async () => {});
  }, AuthorizationException);

  const signedMiddleware = createSignedUrlMiddleware(signer);
  const validUrl = signer.sign("http://localhost/action", 60);

  let sNext = false;
  await signedMiddleware({ request: { url: validUrl } }, async () => { sNext = true; });
  assert.equal(sNext, true);

  await assert.rejects(async () => {
    await signedMiddleware({ request: { url: "http://localhost/action?signature=invalid" } }, async () => {});
  }, AuthorizationException);

  // Role and Permission check
  const permResolver = new PermissionResolver();
  const roleMiddleware = createRoleMiddleware(permResolver);
  const permMiddleware = createPermissionMiddleware(permResolver);

  const adminUser = { roles: ["admin"], permissions: ["billing.read"] };
  let rNext = false;
  await roleMiddleware({ user: adminUser }, async () => { rNext = true; }, "admin");
  assert.equal(rNext, true);

  let pNext = false;
  await permMiddleware({ user: adminUser }, async () => { pNext = true; }, "billing.read");
  assert.equal(pNext, true);
});
