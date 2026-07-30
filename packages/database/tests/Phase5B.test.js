import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Application, Facade } from "@ecf/core";
import DatabaseServiceProvider from "../src/providers/DatabaseServiceProvider.js";
import Model from "../src/orm/Model.js";
import ModelEventBus from "../src/orm/events/ModelEventBus.js";

describe("Phase 5B — Model Event Bus & Observer System", () => {
    let app;
    let dbManager;

    beforeEach(async () => {
        ModelEventBus.clearAllListeners();

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
            t.string("email").nullable();
        });
    });

    afterEach(async () => {
        ModelEventBus.clearAllListeners();
        if (dbManager) {
            await dbManager.disconnect();
        }
    });

    test("Full lifecycle hooks and EventContext payload integrity", async () => {
        const eventsFired = [];

        class User1 extends Model {
            static table = "users";
        }

        User1.on("saving", ctx => eventsFired.push(`saving:${ctx.model.name}`));
        User1.on("creating", ctx => eventsFired.push(`creating:${ctx.model.name}`));
        User1.on("created", ctx => eventsFired.push(`created:${ctx.model.name}`));
        User1.on("saved", ctx => eventsFired.push(`saved:${ctx.model.name}`));
        User1.on("retrieved", ctx => eventsFired.push(`retrieved:${ctx.model.name}`));

        const user = new User1({ name: "Alice", email: "alice@example.com" });
        await user.save();

        assert.deepEqual(eventsFired, [
            "saving:Alice",
            "creating:Alice",
            "created:Alice",
            "saved:Alice"
        ]);

        // Querying model triggers retrieved event
        eventsFired.length = 0;
        const retrievedUser = await User1.find(user.id);
        assert.ok(eventsFired.includes("retrieved:Alice"));
        assert.equal(retrievedUser.email, "alice@example.com");
    });

    test("Pre-event cancellation halts database operation", async () => {
        class User2 extends Model {
            static table = "users";
        }

        // Cancel saving if email is missing
        User2.on("saving", ctx => {
            if (!ctx.model.email) {
                return false;
            }
        });

        const invalidUser = new User2({ name: "NoEmailUser" });
        const saveResult = await invalidUser.save();

        assert.equal(saveResult, false);
        assert.equal(await User2.all().then(col => col.length), 0);

        const validUser = new User2({ name: "ValidUser", email: "valid@example.com" });
        const validSaveResult = await validUser.save();
        assert.ok(validSaveResult);
        assert.equal(await User2.all().then(col => col.length), 1);
    });

    test("Observer Class auto-wiring and priority ordering", async () => {
        const log = [];

        class UserObserver {
            creating(ctx) {
                log.push(`Observer.creating:${ctx.model.name}`);
            }
            created(ctx) {
                log.push(`Observer.created:${ctx.model.name}`);
            }
        }

        class User3 extends Model {
            static table = "users";
        }

        // Priority 5 runs before default priority 10 Observer
        User3.on("creating", ctx => log.push(`Priority5.creating:${ctx.model.name}`), 5);
        User3.observe(UserObserver, 10);

        const user = new User3({ name: "Bob", email: "bob@example.com" });
        await user.save();

        assert.deepEqual(log, [
            "Priority5.creating:Bob",
            "Observer.creating:Bob",
            "Observer.created:Bob"
        ]);
    });

    test("Wildcard Event Listeners (* and model:*)", async () => {
        const wildcardsFired = [];

        class User4 extends Model {
            static table = "users";
        }

        ModelEventBus.on(User4, "*", ctx => wildcardsFired.push(`wildcard:${ctx.event}`));

        const user = new User4({ name: "Charlie", email: "charlie@example.com" });
        await user.save();

        assert.ok(wildcardsFired.includes("wildcard:saving"));
        assert.ok(wildcardsFired.includes("wildcard:creating"));
        assert.ok(wildcardsFired.includes("wildcard:created"));
        assert.ok(wildcardsFired.includes("wildcard:saved"));
    });

    test("Transaction-aware post-event deferral & rollback purging", async () => {
        const eventSequence = [];

        class User5 extends Model {
            static table = "users";
        }

        User5.on("saving", () => eventSequence.push("saving"));
        User5.on("creating", () => eventSequence.push("creating"));
        User5.on("created", () => eventSequence.push("created"));
        User5.on("saved", () => eventSequence.push("saved"));

        const conn = dbManager.connection();

        // 1. Transaction Commit Flow
        await conn.transaction(async () => {
            const user = new User5({ name: "Dave", email: "dave@example.com" });
            await user.save();
            eventSequence.push("in_transaction_done");
        });

        // Pre-events run immediately in transaction, post-events fire after commit
        assert.deepEqual(eventSequence, [
            "saving",
            "creating",
            "in_transaction_done",
            "created",
            "saved"
        ]);

        // 2. Transaction Rollback Flow (Post-events MUST NOT fire on rollback)
        eventSequence.length = 0;
        try {
            await conn.transaction(async () => {
                const user2 = new User5({ name: "Eve", email: "eve@example.com" });
                await user2.save();
                throw new Error("Simulated Transaction Failure");
            });
        } catch (err) {
            // Expected failure
        }

        // Post-events created/saved were purged and NEVER fired
        assert.deepEqual(eventSequence, ["saving", "creating"]);
        assert.equal(await User5.where("name", "Eve").exists(), false);
    });
});
