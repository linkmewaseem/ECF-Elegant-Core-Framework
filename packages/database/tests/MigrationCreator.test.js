import { describe, test, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import MigrationCreator from "../src/migrations/MigrationCreator.js";

describe("MigrationCreator Unit Tests", () => {
    let tempDir;

    afterEach(async () => {
        if (tempDir && fs.existsSync(tempDir)) {
            await fs.promises.rm(tempDir, { recursive: true, force: true });
        }
    });

    test("create() generates timestamped migration file with valid Migration stub", async () => {
        tempDir = path.join(os.tmpdir(), `ecf_mig_test_${Date.now()}`);

        const creator = new MigrationCreator(tempDir);
        const { fileName, filePath, className } = await creator.create("create_users_table", tempDir, { table: "users", create: true });

        assert.equal(className, "CreateUsersTable");
        assert.equal(fs.existsSync(filePath), true);

        const content = await fs.promises.readFile(filePath, "utf-8");
        assert.equal(content.includes("export default class CreateUsersTable extends Migration"), true);
        assert.equal(content.includes('await schema.create("users"'), true);
        assert.equal(content.includes('await schema.dropIfExists("users"'), true);
    });

    test("create() generates alter table stub when create option is false", async () => {
        tempDir = path.join(os.tmpdir(), `ecf_mig_test_alter_${Date.now()}`);

        const creator = new MigrationCreator(tempDir);
        const { filePath, className } = await creator.create("add_phone_to_users_table", tempDir, { table: "users", create: false });

        assert.equal(className, "AddPhoneToUsersTable");
        const content = await fs.promises.readFile(filePath, "utf-8");
        assert.equal(content.includes('await schema.table("users"'), true);
    });
});
