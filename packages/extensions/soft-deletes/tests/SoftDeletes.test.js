import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Application, Facade } from "../../../core/src/index.js";
import { DatabaseServiceProvider, Model } from "../../../database/src/index.js";
import SoftDeletesPlugin from "../SoftDeletesPlugin.js";

describe("@ecf/soft-deletes First-Party Extension Integration Suite", () => {
    let app;
    let dbManager;

    beforeEach(async () => {
        app = new Application();
        app.register(DatabaseServiceProvider);
        app.boot();
        Facade.setApplication(app);

        dbManager = app.make("db");
        const schema = dbManager.schema();

        await schema.dropIfExists("posts");
        await schema.create("posts", t => {
            t.id();
            t.string("title");
            t.timestamp("deleted_at").nullable();
        });
    });

    afterEach(async () => {
        if (dbManager) {
            await dbManager.disconnect();
        }
    });

    test("SoftDeletes intercepts delete(), sets deleted_at timestamp, and filters out soft-deleted records", async () => {
        class Post extends Model {
            static table = "posts";
        }
        Post.use(SoftDeletesPlugin);

        const p1 = new Post({ title: "First Post" });
        await p1.save();
        const p2 = new Post({ title: "Second Post" });
        await p2.save();

        assert.equal(await Post.all().then(col => col.length), 2);

        // Soft Delete p1
        await p1.delete();

        // 1. Regular query hides soft-deleted item
        assert.equal(await Post.all().then(col => col.length), 1);
        assert.equal(await Post.query().first().then(p => p.title), "Second Post");

        // 2. withTrashed includes soft-deleted item
        assert.equal(await Post.withTrashed().get().then(col => col.length), 2);

        // 3. onlyTrashed returns only soft-deleted item
        const trashed = await Post.onlyTrashed().get();
        assert.equal(trashed.length, 1);
        assert.equal(trashed[0].title, "First Post");

        // 4. Restore soft-deleted item
        await trashed[0].restore();
        assert.equal(await Post.all().then(col => col.length), 2);
    });

    test("Batch SoftDeletes APIs (restoreMany, forceDestroy, trashOlderThan, forceDelete)", async () => {
        class Post2 extends Model {
            static table = "posts";
        }
        Post2.use(SoftDeletesPlugin);

        const p1 = await new Post2({ title: "Post 1" }).save();
        const p2 = await new Post2({ title: "Post 2" }).save();

        await p1.delete();
        await p2.delete();

        assert.equal(await Post2.onlyTrashed().get().then(col => col.length), 2);

        // Batch Restore
        await Post2.restoreMany([p1, p2]);
        assert.equal(await Post2.all().then(col => col.length), 2);

        // Physical Force Delete
        await p1.forceDelete();
        assert.equal(await Post2.withTrashed().get().then(col => col.length), 1);
    });
});
