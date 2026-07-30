import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Application, Facade } from "@ecf/core";
import DatabaseServiceProvider from "../src/providers/DatabaseServiceProvider.js";
import DB from "../src/facades/DB.js";
import Model from "../src/orm/Model.js";
import ModelRepository from "../src/orm/ModelRepository.js";

describe("ECF Model Layer - Phase 1 Integration Tests", () => {
    let app;
    let dbManager;

    class User extends Model {
        static table = "users";
    }

    class CustomUser extends Model {
        static table = "users";

        getNameAttribute(value) {
            return value ? value.toUpperCase() : value;
        }

        setEmailAttribute(value) {
            return value ? value.toLowerCase() : value;
        }
    }

    beforeEach(async () => {
        app = new Application();
        app.register(DatabaseServiceProvider);
        app.boot();
        Facade.setApplication(app);

        dbManager = app.make("db");

        // Setup memory database schema
        const schema = dbManager.schema();
        await schema.dropIfExists("users");
        await schema.create("users", (t) => {
            t.id();
            t.string("name");
            t.string("email").nullable();
            t.integer("age").default(18);
        });
    });

    afterEach(async () => {
        if (dbManager) {
            await dbManager.disconnectAll();
        }
    });

    test("ES6 Proxy traps direct property access and mutation cleanly", () => {
        const user = new User({ name: "Ali", email: "ali@ecf.dev" });

        assert.equal(user.name, "Ali");
        assert.equal(user.email, "ali@ecf.dev");

        user.name = "Usman";
        assert.equal(user.name, "Usman");
    });

    test("Attribute mutators and accessors (getNameAttribute, setEmailAttribute)", () => {
        const custom = new CustomUser({ name: "usman", email: "USMAN@ECF.DEV" });

        assert.equal(custom.name, "USMAN");
        assert.equal(custom.email, "usman@ecf.dev");
    });

    test("Dirty tracking (isDirty, isClean, getOriginal, getChanges)", () => {
        const user = new User({ name: "Bilal", age: 22 });
        user.getAttributeManager().syncOriginal();

        assert.equal(user.isClean(), true);
        assert.equal(user.isDirty(), false);

        user.name = "Hamza";

        assert.equal(user.isDirty(), true);
        assert.equal(user.isDirty("name"), true);
        assert.equal(user.isDirty("age"), false);
        assert.equal(user.getOriginal("name"), "Bilal");
        assert.deepEqual(user.getChanges(), { name: "Hamza" });
    });

    test("Active Record save() and delete() interact cleanly with database", async () => {
        const user = new User({ name: "Sara", email: "sara@ecf.dev" });
        await user.save();

        assert.ok(user.id);
        const fetched = await User.find(user.id);
        assert.equal(fetched.name, "Sara");

        user.name = "Sara Khan";
        await user.save();

        const updated = await User.find(user.id);
        assert.equal(updated.name, "Sara Khan");

        const deleted = await user.delete();
        assert.equal(deleted, true);

        const nullUser = await User.find(user.id);
        assert.equal(nullUser, null);
    });

    test("Data Mapper repository().save() works seamlessly alongside Active Record", async () => {
        const user = new User({ name: "DataMapper User" });
        const repo = User.repository();

        assert.ok(repo instanceof ModelRepository);
        await repo.save(user);

        assert.ok(user.id);
        const fetched = await repo.findOrFail(user.id);
        assert.equal(fetched.name, "DataMapper User");
    });

    test("Static helper API delegates to Repository layer", async () => {
        const user1 = await User.create({ name: "User One", age: 25 });
        const user2 = await User.create({ name: "User Two", age: 30 });

        const allUsers = await User.all();
        assert.equal(allUsers.length, 2);

        const found = await User.find(user1.id);
        assert.equal(found.name, "User One");

        const whereResult = await User.where("age", ">", 20).get();
        assert.equal(whereResult.length, 2);
    });

    test("Plugin system hooks fire lifecycle events during model operations", async () => {
        const eventsFired = [];

        User.on("saving", () => eventsFired.push("saving"));
        User.on("creating", () => eventsFired.push("creating"));
        User.on("created", () => eventsFired.push("created"));
        User.on("saved", () => eventsFired.push("saved"));

        const user = await User.create({ name: "Event User" });
        assert.deepEqual(eventsFired, ["saving", "creating", "created", "saved"]);
    });
});
