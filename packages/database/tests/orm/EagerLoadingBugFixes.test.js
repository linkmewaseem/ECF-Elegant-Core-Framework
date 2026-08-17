import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Application, Facade } from "@ecfjs/core";
import DatabaseServiceProvider from "../../src/providers/DatabaseServiceProvider.js";
import Schema from "../../src/facades/Schema.js";
import Model from "../../src/orm/Model.js";

class User extends Model {
    static table = "users";

    posts() {
        return this.hasMany(Post, "user_id");
    }

    profile() {
        return this.hasOne(Profile, "user_id");
    }
}

class Post extends Model {
    static table = "posts";

    user() {
        return this.belongsTo(User, "user_id");
    }

    comments() {
        return this.hasMany(Comment, "post_id");
    }
}

class Profile extends Model {
    static table = "profiles";

    user() {
        return this.belongsTo(User, "user_id");
    }
}

class Comment extends Model {
    static table = "comments";

    post() {
        return this.belongsTo(Post, "post_id");
    }
}

describe("Database Eager Loading Bug Fixes & Edge Cases", () => {
    let app;

    beforeEach(async () => {
        app = new Application();
        app.register(DatabaseServiceProvider);
        app.boot();
        Facade.setApplication(app);

        await Schema.create("users", (table) => {
            table.id();
            table.string("name");
        });

        await Schema.create("posts", (table) => {
            table.id();
            table.integer("user_id").nullable();
            table.string("title");
        });

        await Schema.create("profiles", (table) => {
            table.id();
            table.integer("user_id").nullable();
            table.string("bio");
        });

        await Schema.create("comments", (table) => {
            table.id();
            table.integer("post_id").nullable();
            table.string("body");
        });
    });

    afterEach(async () => {
        await Schema.dropIfExists("comments");
        await Schema.dropIfExists("profiles");
        await Schema.dropIfExists("posts");
        await Schema.dropIfExists("users");
    });

    it("handles eager loading when foreign keys are null or sparse", async () => {
        await User.query().insert({ id: 1, name: "Alice" });
        await User.query().insert({ id: 2, name: "Bob" });

        // Post 1 linked to User 1, Post 2 with null user_id
        await Post.query().insert({ id: 10, user_id: 1, title: "Alice Post" });
        await Post.query().insert({ id: 20, user_id: null, title: "Orphan Post" });

        const posts = await Post.with("user").get();
        assert.equal(posts.length, 2);

        const postWithUser = posts.find(p => p.id === 10);
        const orphanPost = posts.find(p => p.id === 20);

        assert.ok(postWithUser.user);
        assert.equal(postWithUser.user.name, "Alice");

        assert.equal(orphanPost.user, null);
    });

    it("handles deep nested eager loading with sparse relations cleanly", async () => {
        await User.query().insert({ id: 1, name: "Alice" });
        await User.query().insert({ id: 2, name: "Bob" });

        await Post.query().insert({ id: 100, user_id: 1, title: "User 1 Post" });
        await Comment.query().insert({ id: 1000, post_id: 100, body: "Great post!" });

        // Fetch users with posts.comments
        const users = await User.with("posts.comments", "profile").get();
        assert.equal(users.length, 2);

        const alice = users.find(u => u.id === 1);
        const bob = users.find(u => u.id === 2);

        assert.equal(alice.posts.length, 1);
        assert.equal(alice.posts.first().comments.length, 1);
        assert.equal(alice.posts.first().comments.first().body, "Great post!");

        assert.equal(bob.posts.length, 0);
        assert.equal(bob.profile, null);
    });

    it("handles constrained eager loading on sparse parent collections gracefully", async () => {
        await User.query().insert({ id: 1, name: "Alice" });
        await Post.query().insert({ id: 1, user_id: 1, title: "Draft Post" });
        await Post.query().insert({ id: 2, user_id: 1, title: "Published Post" });

        const users = await User.with({
            posts: (query) => query.where("title", "Published Post")
        }).get();

        assert.equal(users.length, 1);
        const posts = users.first().posts;
        assert.equal(posts.length, 1);
        assert.equal(posts.first().title, "Published Post");
    });
});
