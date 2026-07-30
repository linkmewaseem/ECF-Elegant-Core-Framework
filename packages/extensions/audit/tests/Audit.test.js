import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Application, Facade } from "../../../core/src/index.js";
import { DatabaseServiceProvider, Model } from "../../../database/src/index.js";
import AuditPlugin from "../AuditPlugin.js";

describe("@ecf/audit First-Party Extension Integration Suite", () => {
    let app;
    let dbManager;

    beforeEach(async () => {
        app = new Application();
        app.register(DatabaseServiceProvider);
        app.boot();
        Facade.setApplication(app);

        dbManager = app.make("db");
        const schema = dbManager.schema();

        await schema.dropIfExists("accounts");
        await schema.create("accounts", t => {
            t.id();
            t.string("title");
            t.integer("balance");
        });
    });

    afterEach(async () => {
        if (dbManager) {
            await dbManager.disconnect();
        }
    });

    test("AuditPlugin records change payload on model create, update, and delete", async () => {
        const auditLog = [];

        const auditPlugin = new AuditPlugin({
            userResolver: () => ({ id: 42, username: "waseem" }),
            ipResolver: () => "192.168.1.100",
            requestIdResolver: () => "req-xyz-99",
            handler: (payload) => auditLog.push(payload)
        });

        class Account extends Model {
            static table = "accounts";
        }
        Account.use(auditPlugin);

        // 1. Create event
        const acc = new Account({ title: "Checking", balance: 1000 });
        await acc.save();

        assert.equal(auditLog.length, 1);
        assert.equal(auditLog[0].event, "created");
        assert.equal(auditLog[0].user.username, "waseem");
        assert.equal(auditLog[0].ip, "192.168.1.100");

        // 2. Update event
        acc.setAttribute("balance", 1500);
        await acc.save();

        assert.equal(auditLog.length, 2);
        assert.equal(auditLog[1].event, "updated");

        // 3. Delete event
        await acc.delete();

        assert.equal(auditLog.length, 3);
        assert.equal(auditLog[2].event, "deleted");
    });
});
