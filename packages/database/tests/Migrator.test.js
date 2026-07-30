import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import ConnectionManager from "../src/ConnectionManager.js";
import DatabaseManager from "../src/DatabaseManager.js";
import MigrationRepository from "../src/migrations/MigrationRepository.js";
import Migrator from "../src/migrations/Migrator.js";
import Migration from "../src/migrations/Migration.js";

describe("Migrator Integration Tests", () => {
    let connectionManager;
    let dbManager;
    let repository;
    let migrator;

    class CreateUsersTable extends Migration {
        async up(schema) {
            await schema.create("users", (t) => {
                t.id();
                t.string("name");
            });
        }
        async down(schema) {
            await schema.dropIfExists("users");
        }
    }

    class CreatePostsTable extends Migration {
        async up(schema) {
            await schema.create("posts", (t) => {
                t.id();
                t.string("title");
            });
        }
        async down(schema) {
            await schema.dropIfExists("posts");
        }
    }

    class FailingMigration extends Migration {
        async up(schema) {
            await schema.create("fail_table", (t) => {
                t.id();
            });
            throw new Error("Simulated Migration Failure");
        }
        async down(schema) {
            await schema.dropIfExists("fail_table");
        }
    }

    const migrationsMap = {
        "2026_07_28_000001_create_users_table": CreateUsersTable,
        "2026_07_28_000002_create_posts_table": CreatePostsTable
    };

    beforeEach(async () => {
        connectionManager = new ConnectionManager({
            default: "sqlite",
            connections: {
                sqlite: { driver: "sqlite", database: ":memory:" }
            }
        });
        dbManager = new DatabaseManager(connectionManager);
        repository = new MigrationRepository(dbManager.connection(), "migrations");
        migrator = new Migrator(repository, dbManager.connection());
    });

    afterEach(async () => {
        if (dbManager) {
            await dbManager.disconnectAll();
        }
    });

    test("run() & migrate() execute pending migrations in batch 1 and create tables", async () => {
        const result = await migrator.migrate(migrationsMap);

        assert.equal(result.batch, 1);
        assert.equal(result.ran.length, 2);

        const schema = dbManager.schema();
        assert.equal(await schema.hasTable("users"), true);
        assert.equal(await schema.hasTable("posts"), true);

        // Subsequent run when no pending migrations exist
        const result2 = await migrator.run(migrationsMap);
        assert.equal(result2.ran.length, 0);
    });

    test("status() returns status of ran vs pending migrations", async () => {
        await migrator.run({
            "2026_07_28_000001_create_users_table": CreateUsersTable
        });

        const status = await migrator.status(migrationsMap);
        assert.equal(status.length, 2);

        assert.equal(status[0].name, "2026_07_28_000001_create_users_table");
        assert.equal(status[0].ran, true);
        assert.equal(status[0].batch, 1);

        assert.equal(status[1].name, "2026_07_28_000002_create_posts_table");
        assert.equal(status[1].ran, false);
    });

    test("rollback() rolls back last batch and reset() rolls back all batches", async () => {
        // Batch 1
        await migrator.run({
            "2026_07_28_000001_create_users_table": CreateUsersTable
        });

        // Batch 2
        await migrator.run({
            "2026_07_28_000002_create_posts_table": CreatePostsTable
        });

        const schema = dbManager.schema();
        assert.equal(await schema.hasTable("users"), true);
        assert.equal(await schema.hasTable("posts"), true);

        // Rollback batch 2
        const rollbackResult = await migrator.rollback(migrationsMap);
        assert.equal(rollbackResult.rolledBack.length, 1);
        assert.equal(rollbackResult.rolledBack[0], "2026_07_28_000002_create_posts_table");

        assert.equal(await schema.hasTable("posts"), false);
        assert.equal(await schema.hasTable("users"), true);

        // Reset all remaining batches
        const resetResult = await migrator.reset(migrationsMap);
        assert.equal(resetResult.rolledBack.length, 1);
        assert.equal(resetResult.rolledBack[0], "2026_07_28_000001_create_users_table");

        assert.equal(await schema.hasTable("users"), false);
    });

    test("refresh() resets and re-runs all migrations", async () => {
        await migrator.run(migrationsMap);

        const refreshResult = await migrator.refresh(migrationsMap);
        assert.equal(refreshResult.rolledBack.length, 2);
        assert.equal(refreshResult.ran.length, 2);
        assert.equal(refreshResult.batch, 1);

        const schema = dbManager.schema();
        assert.equal(await schema.hasTable("users"), true);
        assert.equal(await schema.hasTable("posts"), true);
    });

    test("fresh() drops all existing schema tables and re-runs all migrations from scratch", async () => {
        await migrator.run(migrationsMap);
        const schema = dbManager.schema();
        assert.equal(await schema.hasTable("users"), true);

        const freshResult = await migrator.fresh(migrationsMap);
        assert.equal(freshResult.ran.length, 2);
        assert.equal(freshResult.batch, 1);
        assert.equal(await schema.hasTable("users"), true);
        assert.equal(await schema.hasTable("posts"), true);
    });

    test("dispatches MigrationFailed event and rolls back transaction on error", async () => {
        let eventFired = false;
        dbManager.connection().setEventDispatcher((eventName, payload) => {
            if (eventName === "MigrationFailed") {
                eventFired = true;
                assert.equal(payload.migration, "2026_07_28_000003_failing");
            }
        });

        await assert.rejects(async () => {
            await migrator.run({
                "2026_07_28_000003_failing": FailingMigration
            });
        }, /Simulated Migration Failure/);

        assert.equal(eventFired, true);

        // Ensure table was rolled back by transaction
        const schema = dbManager.schema();
        assert.equal(await schema.hasTable("fail_table"), false);
    });
});
