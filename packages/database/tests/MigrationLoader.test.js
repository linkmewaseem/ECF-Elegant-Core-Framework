import { describe, test } from "node:test";
import assert from "node:assert/strict";
import MigrationLoader from "../src/migrations/MigrationLoader.js";
import Migration from "../src/migrations/Migration.js";

describe("MigrationLoader Unit Tests", () => {
    test("loads migration objects from explicit map and instantiates migration classes", async () => {
        class CreateUsersTable extends Migration {
            async up(schema) {
                await schema.create("users", (t) => t.id());
            }
        }

        const map = {
            "2026_07_28_000001_create_users_table": CreateUsersTable,
            "2026_07_28_000002_create_posts_table": {
                async up(schema) {
                    await schema.create("posts", (t) => t.id());
                }
            }
        };

        const loader = new MigrationLoader();
        const loaded = await loader.load(map);

        assert.equal(loaded.length, 2);
        assert.equal(loaded[0].name, "2026_07_28_000001_create_users_table");
        assert.equal(typeof loaded[0].instance.up, "function");
        assert.equal(loaded[1].name, "2026_07_28_000002_create_posts_table");
        assert.equal(typeof loaded[1].instance.up, "function");
    });
});
