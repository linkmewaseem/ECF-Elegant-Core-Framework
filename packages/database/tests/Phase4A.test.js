import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Application, Facade } from "@ecf/core";
import DatabaseServiceProvider from "../src/providers/DatabaseServiceProvider.js";
import Model from "../src/orm/Model.js";
import ModelCollection from "../src/orm/ModelCollection.js";
import IdentityMap from "../src/orm/loader/IdentityMap.js";
import RelationPlan from "../src/orm/loader/RelationPlan.js";

describe("ECF Phase 4A - Core Query Intelligence Tests", () => {
    let app;
    let dbManager;

    class User extends Model {
        static table = "users";

        posts() {
            return this.hasMany(Post);
        }
    }

    class Post extends Model {
        static table = "posts";

        user() {
            return this.belongsTo(User);
        }

        comments() {
            return this.hasMany(Comment);
        }
    }

    class Comment extends Model {
        static table = "comments";

        user() {
            return this.belongsTo(User);
        }
    }

    beforeEach(async () => {
        app = new Application();
        app.register(DatabaseServiceProvider);
        app.boot();
        Facade.setApplication(app);

        dbManager = app.make("db");
        const schema = dbManager.schema();

        await schema.dropIfExists("comments");
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
            t.string("status").default("published");
        });

        await schema.create("comments", t => {
            t.id();
            t.integer("post_id");
            t.integer("user_id");
            t.string("body");
        });
    });

    afterEach(async () => {
        if (dbManager) {
            await dbManager.disconnectAll();
        }
    });

    test("IdentityMap registry & object instance deduplication", () => {
        const map = new IdentityMap();
        const u1 = new User({}, true);
        u1.forceFill({ id: 1, name: "Ali" });

        map.register(u1);
        assert.strictEqual(map.get(User, 1), u1);
        assert.strictEqual(map.has(User, 1), true);

        // Clear registry
        map.clear();
        assert.strictEqual(map.has(User, 1), false);
    });

    test("RelationPlan tree compiler & immutability", () => {
        const plan = RelationPlan.compile(["posts.comments.user", { "posts": q => q }]);
        assert.ok(Object.isFrozen(plan));
        assert.ok(plan.children.has("posts"));

        const postsNode = plan.getChild("posts");
        assert.ok(postsNode.children.has("comments"));

        const commentsNode = postsNode.getChild("comments");
        assert.ok(commentsNode.children.has("user"));
    });

    test("Batch eager loading with() eliminates N+1 queries", async () => {
        const u1 = await User.create({ name: "User 1" });
        const u2 = await User.create({ name: "User 2" });

        await Post.create({ user_id: u1.id, title: "Post U1-1" });
        await Post.create({ user_id: u1.id, title: "Post U1-2" });
        await Post.create({ user_id: u2.id, title: "Post U2-1" });

        const users = await User.with("posts").get();

        assert.ok(users instanceof ModelCollection);
        assert.equal(users.length, 2);

        assert.equal(users[0].posts.length, 2);
        assert.equal(users[1].posts.length, 1);
        assert.equal(users[0].posts[0].title, "Post U1-1");
    });

    test("Nested eager loading with('posts.comments.user')", async () => {
        const u1 = await User.create({ name: "Author" });
        const p1 = await Post.create({ user_id: u1.id, title: "Deep Post" });
        const c1 = await Comment.create({ post_id: p1.id, user_id: u1.id, body: "Great article" });

        const users = await User.with("posts.comments.user").get();
        assert.equal(users.length, 1);

        const loadedPost = users[0].posts[0];
        assert.equal(loadedPost.title, "Deep Post");

        const loadedComment = loadedPost.comments[0];
        assert.equal(loadedComment.body, "Great article");

        // IdentityMap deduplication check: nested user is same object reference!
        assert.strictEqual(loadedComment.user.id, u1.id);
        assert.strictEqual(loadedComment.user, users[0]);
    });

    test("Relation constraints with({ posts: q => q.where('status', 'published') })", async () => {
        const user = await User.create({ name: "Constrained User" });
        await Post.create({ user_id: user.id, title: "Public", status: "published" });
        await Post.create({ user_id: user.id, title: "Secret", status: "draft" });

        const users = await User.with({
            posts: q => q.where("status", "published")
        }).get();

        assert.equal(users[0].posts.length, 1);
        assert.equal(users[0].posts[0].title, "Public");
    });

    test("Lazy eager loading users.load('posts')", async () => {
        const u1 = await User.create({ name: "Lazy User" });
        await Post.create({ user_id: u1.id, title: "Lazy Post" });

        const users = await User.all();
        assert.equal(users[0].isRelationLoaded("posts"), false);

        await users.load("posts");
        assert.equal(users[0].isRelationLoaded("posts"), true);
        assert.equal(users[0].posts.length, 1);
        assert.equal(users[0].posts[0].title, "Lazy Post");
    });
});
