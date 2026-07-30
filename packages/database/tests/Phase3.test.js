import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Application, Facade } from "@ecf/core";
import DatabaseServiceProvider from "../src/providers/DatabaseServiceProvider.js";
import Model from "../src/orm/Model.js";
import Relation from "../src/orm/relations/Relation.js";
import HasOne from "../src/orm/relations/HasOne.js";
import HasMany from "../src/orm/relations/HasMany.js";
import BelongsTo from "../src/orm/relations/BelongsTo.js";
import BelongsToMany from "../src/orm/relations/BelongsToMany.js";

describe("ECF Phase 3 - Relationship Engine Tests", () => {
    let app;
    let dbManager;

    class User extends Model {
        static table = "users";

        phone() {
            return this.hasOne(Phone);
        }

        posts() {
            return this.hasMany(Post);
        }

        roles() {
            return this.belongsToMany(Role);
        }
    }

    class Phone extends Model {
        static table = "phones";

        user() {
            return this.belongsTo(User);
        }
    }

    class Post extends Model {
        static table = "posts";

        user() {
            return this.belongsTo(User);
        }
    }

    class Role extends Model {
        static table = "roles";

        users() {
            return this.belongsToMany(User);
        }
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
        await schema.dropIfExists("posts");
        await schema.dropIfExists("phones");
        await schema.dropIfExists("users");

        await schema.create("users", (t) => {
            t.id();
            t.string("name");
        });

        await schema.create("phones", (t) => {
            t.id();
            t.integer("user_id");
            t.string("number");
        });

        await schema.create("posts", (t) => {
            t.id();
            t.integer("user_id");
            t.string("title");
            t.integer("views").default(0);
        });

        await schema.create("roles", (t) => {
            t.id();
            t.string("name");
        });

        await schema.create("role_user", (t) => {
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

    test("Relation Base Architecture, Composition & Metadata", () => {
        const user = new User({ id: 1, name: "Test User" });

        const hasOneRel = user.phone();
        assert.ok(hasOneRel instanceof Relation);
        assert.ok(hasOneRel instanceof HasOne);
        assert.equal(hasOneRel.meta.type, "hasOne");
        assert.equal(hasOneRel.meta.foreignKey, "user_id");
        assert.equal(hasOneRel.meta.localKey, "id");

        const hasManyRel = user.posts();
        assert.ok(hasManyRel instanceof HasMany);
        assert.equal(hasManyRel.meta.type, "hasMany");

        const belongsToRel = new Phone({ id: 10, user_id: 1 }).user();
        assert.ok(belongsToRel instanceof BelongsTo);
        assert.equal(belongsToRel.meta.type, "belongsTo");
        assert.equal(belongsToRel.meta.foreignKey, "user_id");

        const belongsToManyRel = user.roles();
        assert.ok(belongsToManyRel instanceof BelongsToMany);
        assert.equal(belongsToManyRel.meta.type, "belongsToMany");
        assert.equal(belongsToManyRel.meta.pivotTable, "role_user");
    });

    test("HasOne relationship resolution & metadata inspection", async () => {
        const user = await User.create({ name: "ECF Creator" });
        const phone = await Phone.create({ user_id: user.id, number: "+123456789" });

        // QueryBuilder proxying &Thenable protocol
        const fetchedPhone = await user.phone();

        assert.ok(fetchedPhone instanceof Phone);
        assert.equal(fetchedPhone.number, "+123456789");

        // Dynamic property access caching on parent model
        assert.equal(user.phone.number, "+123456789");
    });

    test("HasMany relationship & QueryBuilder method chaining", async () => {
        const user = await User.create({ name: "Blogger" });

        await Post.create({ user_id: user.id, title: "Post 1", views: 10 });
        await Post.create({ user_id: user.id, title: "Post 2", views: 50 });
        await Post.create({ user_id: user.id, title: "Post 3", views: 100 });

        const posts = await user.posts();
        assert.equal(posts.length, 3);

        // Chain QueryBuilder methods directly on Relation
        const popularPost = await user.posts().where("views", ">=", 100).first();
        assert.equal(popularPost.title, "Post 3");
    });

    test("BelongsTo relationship resolution", async () => {
        const user = await User.create({ name: "Owner User" });
        const post = await Post.create({ user_id: user.id, title: "Owned Post" });

        const owner = await post.user();
        assert.ok(owner instanceof User);
        assert.equal(owner.name, "Owner User");
    });

    test("BelongsToMany pivot relationship resolution", async () => {
        const user = await User.create({ name: "MultiRole User" });
        const adminRole = await Role.create({ name: "Admin" });
        const editorRole = await Role.create({ name: "Editor" });

        await dbManager.table("role_user").insert({ user_id: user.id, role_id: adminRole.id });
        await dbManager.table("role_user").insert({ user_id: user.id, role_id: editorRole.id });

        const roles = await user.roles();
        assert.equal(roles.length, 2);

        const roleNames = roles.pluck("name").join(", ");
        assert.equal(roleNames, "Admin, Editor");
    });

    test("Custom foreign and local keys support", () => {
        class CustomUser extends Model {
            static primaryKey = "uuid";

            posts() {
                return this.hasMany(Post, "author_id", "uuid");
            }
        }

        const user = new CustomUser({ uuid: "usr_123" });
        const rel = user.posts();

        assert.equal(rel.meta.foreignKey, "author_id");
        assert.equal(rel.meta.localKey, "uuid");
    });

    test("Lazy relation caching & user.refresh() clear cache", async () => {
        const user = await User.create({ name: "Cache User" });
        await Phone.create({ user_id: user.id, number: "111-222" });

        // Access via property triggers lazy resolution and caches relation
        const phone1 = await user.phone();
        assert.equal(phone1.number, "111-222");

        // Update phone in DB
        await dbManager.table("phones").where("id", phone1.id).update({ number: "999-000" });

        // user.refresh() invalidates relation cache
        await user.refresh();
        const phone2 = await user.phone();
        assert.equal(phone2.number, "999-000");
    });

    test("Empty relations handle unpersisted models gracefully", async () => {
        const newModel = new User({ name: "Unsaved" });

        const posts = await newModel.posts();
        assert.equal(posts.length, 0);

        const phone = await newModel.phone();
        assert.equal(phone, null);
    });
});
