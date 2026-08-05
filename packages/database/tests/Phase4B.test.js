import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Application, Facade } from "@ecfjs/core";
import DatabaseServiceProvider from "../src/providers/DatabaseServiceProvider.js";
import Model from "../src/orm/Model.js";
import ModelCollection from "../src/orm/ModelCollection.js";

describe("ECF Phase 4B - Advanced Query Intelligence & Profiles Tests", () => {
    let app;
    let dbManager;

    class User extends Model {
        static table = "users";
        static profiles = {
            basic: ["roles"],
            dashboard: ["@basic", "posts"]
        };

        posts() {
            return this.hasMany(Post);
        }

        orders() {
            return this.hasMany(Order);
        }

        roles() {
            return this.belongsToMany(Role);
        }
    }

    class Post extends Model {
        static table = "posts";

        user() {
            return this.belongsTo(User);
        }
    }

    class Order extends Model {
        static table = "orders";

        user() {
            return this.belongsTo(User);
        }
    }

    class Role extends Model {
        static table = "roles";
    }

    beforeEach(async () => {
        app = new Application();
        app.register(DatabaseServiceProvider);
        app.boot();
        Facade.setApplication(app);

        dbManager = app.make("db");
        const schema = dbManager.schema();

        await schema.dropIfExists("role_user");
        await schema.dropIfExists("roles");
        await schema.dropIfExists("orders");
        await schema.dropIfExists("posts");
        await schema.dropIfExists("users");

        await schema.create("users", t => {
            t.id();
            t.string("name");
        });

        await schema.create("posts", t => {
            t.id();
            t.integer("user_id");
            t.string("title");
        });

        await schema.create("orders", t => {
            t.id();
            t.integer("user_id");
            t.float("amount");
        });

        await schema.create("roles", t => {
            t.id();
            t.string("name");
        });

        await schema.create("role_user", t => {
            t.id();
            t.integer("user_id");
            t.integer("role_id");
        });
    });

    afterEach(async () => {
        if (dbManager) {
            await dbManager.disconnectAll();
        }
    });

    test("Aggregate eager loading: withCount & withExists", async () => {
        const user = await User.create({ name: "Order User" });
        await Post.create({ user_id: user.id, title: "Post 1" });
        await Post.create({ user_id: user.id, title: "Post 2" });

        const users = await User.withCount("posts").withExists("posts").get();

        assert.equal(users[0].posts_count, 2);
        assert.equal(users[0].has_posts, true);
    });

    test("Aggregate eager loading: withSum, withAvg, withMin, withMax", async () => {
        const user = await User.create({ name: "Buyer" });
        await Order.create({ user_id: user.id, amount: 100 });
        await Order.create({ user_id: user.id, amount: 200 });

        const users = await User.withSum("orders", "amount")
            .withAvg("orders", "amount")
            .withMin("orders", "amount")
            .withMax("orders", "amount")
            .get();

        assert.equal(users[0].orders_sum_amount, 300);
        assert.equal(users[0].orders_avg_amount, 150);
        assert.equal(users[0].orders_min_amount, 100);
        assert.equal(users[0].orders_max_amount, 200);
    });

    test("Smart Profile composition & inheritance (@basic)", async () => {
        const user = await User.create({ name: "Profile User" });
        const role = await Role.create({ name: "Admin" });
        await dbManager.table("role_user").insert({ user_id: user.id, role_id: role.id });
        await Post.create({ user_id: user.id, title: "Profile Post" });

        const users = await User.profile("dashboard").get();

        assert.equal(users[0].isRelationLoaded("roles"), true);
        assert.equal(users[0].isRelationLoaded("posts"), true);
        assert.equal(users[0].roles.length, 1);
        assert.equal(users[0].posts.length, 1);
    });

    test("Relation Load State & reload / unload", async () => {
        const user = await User.create({ name: "State User" });
        await Post.create({ user_id: user.id, title: "Initial Post" });

        await user.load("posts");
        assert.equal(user.isRelationLoaded("posts"), true);

        user.unloadRelation("posts");
        assert.equal(user.isRelationLoaded("posts"), false);

        await Post.create({ user_id: user.id, title: "Second Post" });
        await user.reload("posts");
        assert.equal(user.posts.length, 2);
    });

    test("Cache versioning invalidates stale relation caches on save", async () => {
        const user = await User.create({ name: "Version User" });
        const initialVersion = user.getAttributeManager().cacheVersion;

        user.getAttributeManager().setRelation("posts", new ModelCollection());
        user.name = "Version User Updated";
        await user.save();

        const newVersion = user.getAttributeManager().cacheVersion;
        assert.ok(newVersion > initialVersion);
        assert.equal(user.getAttributeManager().hasRelation("posts"), false);
    });

    test("Query Plan Inspector (.debug())", async () => {
        const user = await User.create({ name: "Debug User" });

        const users = await User.with("posts").debug().get();
        assert.ok(users._debugReport);
        assert.ok(users._debugReport.queries >= 1);
        assert.equal(users._debugReport.hydratedModels, 1);
    });
});
