import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import ConnectionManager from "../src/ConnectionManager.js";
import DatabaseManager from "../src/DatabaseManager.js";
import MigrationRepository from "../src/migrations/MigrationRepository.js";

describe("MigrationRepository Unit Tests", () => {
    let connectionManager;
    let dbManager;
    let repository;

    beforeEach(async () => {
        connectionManager = new ConnectionManager({
            default: "sqlite",
            connections: {
                sqlite: { driver: "sqlite", database: ":memory:" }
            }
        });
        dbManager = new DatabaseManager(connectionManager);
        repository = new MigrationRepository(dbManager.connection(), "migrations");
    });

    afterEach(async () => {
        if (dbManager) {
            await dbManager.disconnectAll();
        }
    });

    test("repositoryExists() returns false initially and true after createRepository()", async () => {
        assert.equal(await repository.repositoryExists(), false);

        await repository.createRepository();
        assert.equal(await repository.repositoryExists(), true);
    });

    test("log(), getRan(), getLastBatchNumber(), getNextBatchNumber(), and delete() track state", async () => {
        await repository.createRepository();

        assert.deepEqual(await repository.getRan(), []);
        assert.equal(await repository.getLastBatchNumber(), 0);
        assert.equal(await repository.getNextBatchNumber(), 1);

        await repository.log("2026_07_28_000001_create_users_table", 1, "app", "abc123hash");
        await repository.log("2026_07_28_000002_create_posts_table", 1, "app");

        const ran = await repository.getRan();
        assert.equal(ran.length, 2);
        assert.equal(ran[0], "2026_07_28_000001_create_users_table");
        assert.equal(ran[1], "2026_07_28_000002_create_posts_table");

        assert.equal(await repository.getLastBatchNumber(), 1);
        assert.equal(await repository.getNextBatchNumber(), 2);

        const lastRecords = await repository.getLast();
        assert.equal(lastRecords.length, 2);

        await repository.delete("2026_07_28_000002_create_posts_table");
        const remainingRan = await repository.getRan();
        assert.equal(remainingRan.length, 1);
        assert.equal(remainingRan[0], "2026_07_28_000001_create_users_table");
    });
});
