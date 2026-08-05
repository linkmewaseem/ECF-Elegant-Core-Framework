import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Application, Facade } from "../../../core/src/index.js";
import { DatabaseServiceProvider, Model } from "../../../database/src/index.js";
import TimestampsPlugin from "../TimestampsPlugin.js";

describe("@ecfjs/timestamps First-Party Extension Integration Suite", () => {
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
            t.timestamp("created_at").nullable();
            t.timestamp("updated_at").nullable();
        });
    });

    afterEach(async () => {
        if (dbManager) {
            await dbManager.disconnect();
        }
    });

    test("TimestampsPlugin populates created_at and updated_at automatically on save and update", async () => {
        class User extends Model {
            static table = "users";
        }
        User.use(TimestampsPlugin);

        const user = new User({ name: "Alice" });
        await user.save();

        assert.ok(user.getAttribute("created_at"));
        assert.ok(user.getAttribute("updated_at"));

        const initialUpdate = user.getAttribute("updated_at");

        // Wait brief moment and update
        await new Promise(r => setTimeout(r, 10));
        user.setAttribute("name", "Alice Updated");
        await user.save();

        assert.ok(user.getAttribute("updated_at"));
        assert.notEqual(user.getAttribute("updated_at"), initialUpdate);
    });
});
