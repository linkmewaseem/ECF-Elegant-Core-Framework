import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Application, Facade } from "@ecfjs/core";
import DatabaseServiceProvider from "../src/providers/DatabaseServiceProvider.js";
import Model from "../src/orm/Model.js";
import PluginManager from "../src/orm/PluginManager.js";

describe("Phase 5A — Global & Local Scope Intelligence Engine", () => {
    let app;
    let dbManager;

    beforeEach(async () => {
        app = new Application();
        app.register(DatabaseServiceProvider);
        app.boot();
        Facade.setApplication(app);

        dbManager = app.make("db");
        const schema = dbManager.schema();

        await schema.dropIfExists("users");
        await schema.create("users", t => {
            t.id();
            t.string("name");
            t.string("role").default("user");
            t.integer("active").default(1);
            t.integer("tenant_id").default(1);
        });

        await dbManager.table("users").insert([
            { name: "Alice", role: "admin", active: 1, tenant_id: 1 },
            { name: "Bob", role: "user", active: 1, tenant_id: 1 },
            { name: "Charlie", role: "admin", active: 0, tenant_id: 1 },
            { name: "Dave", role: "admin", active: 1, tenant_id: 2 }
        ]);
    });

    afterEach(async () => {
        if (dbManager) {
            await dbManager.disconnect();
        }
    });

    test("Global Scopes registration and deferred non-destructive application", async () => {
        class User1 extends Model {
            static table = "users";
            static boot() {
                this.addGlobalScope("active", q => {
                    q.where("active", 1);
                });
            }
        }

        // 1. AST before execution should NOT be mutated permanently
        const query = User1.query();
        assert.equal(query.ast.wheres.length, 0);

        // 2. Query execution applies active scope automatically
        const activeUsers = await query.get();
        assert.equal(activeUsers.length, 3);
        const names = activeUsers.pluck("name");
        assert.deepEqual(names, ["Alice", "Bob", "Dave"]);

        // 3. toSql() includes scope without mutating original builder clone
        const sql = User1.where("role", "admin").toSql();
        assert.match(sql.sql, /WHERE.*role.*=.*AND.*active.*=/);
    });

    test("Scope bypassing via withoutGlobalScope and withoutGlobalScopes", async () => {
        class User2 extends Model {
            static table = "users";
            static boot() {
                this.addGlobalScope("active", q => {
                    q.where("active", 1);
                });
                this.addGlobalScope("tenant", q => {
                    q.where("tenant_id", 1);
                });
            }
        }

        // Default query includes both active and tenant
        const defaultUsers = await User2.all();
        assert.equal(defaultUsers.length, 2); // Alice and Bob

        // Remove single scope: withoutGlobalScope('active')
        const allTenantUsers = await User2.withoutGlobalScope("active").get();
        assert.equal(allTenantUsers.length, 3); // Alice, Bob, Charlie

        // Remove all scopes: withoutGlobalScopes()
        const allUsers = await User2.withoutGlobalScopes().get();
        assert.equal(allUsers.length, 4); // Alice, Bob, Charlie, Dave
    });

    test("Scope Objects with priority, when condition, and remove handler", async () => {
        let tenantActive = true;

        class TenantScope {
            name = "tenant";
            priority = 1; // Highest priority
            when() {
                return tenantActive;
            }
            apply(q) {
                q.where("tenant_id", 1);
            }
            remove(q) {
                // Cleanup handler
            }
        }

        class ActiveScope {
            name = "active";
            priority = 10;
            apply(q) {
                q.where("active", 1);
            }
        }

        class User3 extends Model {
            static table = "users";
            static boot() {
                this.addGlobalScope(new TenantScope());
                this.addGlobalScope(new ActiveScope());
            }
        }

        // Active tenant condition true
        const q1 = User3.query();
        await q1.get();
        const state1 = q1.scopeState;
        assert.equal(state1.get("tenant"), "Applied");
        assert.equal(state1.get("active"), "Applied");

        // Disable tenant condition dynamically
        tenantActive = false;
        const q2 = User3.query();
        await q2.get();
        const state2 = q2.scopeState;
        assert.equal(state2.get("tenant"), "Skipped");
        assert.equal(state2.get("active"), "Applied");

        // Explicitly bypass active scope
        const q3 = User3.withoutGlobalScope("active");
        await q3.get();
        const state3 = q3.scopeState;
        assert.equal(state3.get("active"), "Removed");
    });

    test("Scope Lifecycle Events (scopeApplying, scopeApplied, scopeSkipped, scopeRemoved)", async () => {
        const eventsFired = [];

        class User4 extends Model {
            static table = "users";
            static boot() {
                this.addGlobalScope("active", q => q.where("active", 1));
                this.addGlobalScope("conditional", {
                    name: "conditional",
                    apply: q => q.where("role", "admin"),
                    when: () => false
                });
            }
        }

        PluginManager.addListener(User4, "scopeApplying", (m, payload) => eventsFired.push(`applying:${payload.scope}`));
        PluginManager.addListener(User4, "scopeApplied", (m, payload) => eventsFired.push(`applied:${payload.scope}`));
        PluginManager.addListener(User4, "scopeSkipped", (m, payload) => eventsFired.push(`skipped:${payload.scope}`));
        PluginManager.addListener(User4, "scopeRemoved", (m, payload) => eventsFired.push(`removed:${payload.scope}`));

        await User4.withoutGlobalScope("active").get();

        assert.ok(eventsFired.includes("removed:active"));
        assert.ok(eventsFired.includes("skipped:conditional"));
    });

    test("Local Scopes startup caching & static/chained invocation", async () => {
        class User5 extends Model {
            static table = "users";

            scopeAdmins(q) {
                return q.where("role", "admin");
            }

            scopeOfType(q, roleType) {
                return q.where("role", roleType);
            }
        }

        // 1. Startup caching check
        User5.bootIfNeeded();
        assert.ok(User5.meta.scopes.has("admins"));
        assert.ok(User5.meta.scopes.has("ofType"));

        // 2. Direct static method call on Model: User5.admins()
        const admins = await User5.admins().get();
        assert.equal(admins.length, 3);
        assert.deepEqual(admins.pluck("name"), ["Alice", "Charlie", "Dave"]);

        // 3. Dynamic parameterized scope on Model query chain: User5.query().ofType('user')
        const normalUsers = await User5.query().ofType("user").get();
        assert.equal(normalUsers.length, 1);
        assert.equal(normalUsers.first().name, "Bob");

        // 4. Scope chaining combined with wheres
        const activeAdmins = await User5.where("active", 1).admins().get();
        assert.equal(activeAdmins.length, 2);
        assert.deepEqual(activeAdmins.pluck("name"), ["Alice", "Dave"]);
    });
});
