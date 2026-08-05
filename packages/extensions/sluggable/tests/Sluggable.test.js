import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Application, Facade } from "../../../core/src/index.js";
import { DatabaseServiceProvider, Model } from "../../../database/src/index.js";
import SluggablePlugin from "../SluggablePlugin.js";

describe("@ecfjs/sluggable First-Party Extension Integration Suite", () => {
    let app;
    let dbManager;

    beforeEach(async () => {
        app = new Application();
        app.register(DatabaseServiceProvider);
        app.boot();
        Facade.setApplication(app);

        dbManager = app.make("db");
        const schema = dbManager.schema();

        await schema.dropIfExists("articles");
        await schema.create("articles", t => {
            t.id();
            t.string("title");
            t.string("slug").nullable();
        });
    });

    afterEach(async () => {
        if (dbManager) {
            await dbManager.disconnect();
        }
    });

    test("SluggablePlugin generates URL slug from source title", async () => {
        class Article extends Model {
            static table = "articles";
        }
        Article.use(SluggablePlugin);

        const article = new Article({ title: "My First ECF Post!" });
        await article.save();

        assert.equal(article.getAttribute("slug"), "my-first-ecf-post");
    });

    test("SluggablePlugin resolves numeric collisions uniquely (my-post, my-post-1)", async () => {
        class Article2 extends Model {
            static table = "articles";
        }
        Article2.use(new SluggablePlugin({ unique: true }));

        const a1 = new Article2({ title: "Duplicate Title" });
        await a1.save();
        assert.equal(a1.getAttribute("slug"), "duplicate-title");

        const a2 = new Article2({ title: "Duplicate Title" });
        await a2.save();
        assert.equal(a2.getAttribute("slug"), "duplicate-title-1");

        const a3 = new Article2({ title: "Duplicate Title" });
        await a3.save();
        assert.equal(a3.getAttribute("slug"), "duplicate-title-2");
    });
});
