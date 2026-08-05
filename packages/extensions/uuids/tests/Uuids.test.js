import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Application, Facade } from "../../../core/src/index.js";
import { DatabaseServiceProvider, Model } from "../../../database/src/index.js";
import UuidsPlugin from "../UuidsPlugin.js";

describe("@ecfjs/uuids First-Party Extension Integration Suite", () => {
    let app;
    let dbManager;

    beforeEach(async () => {
        app = new Application();
        app.register(DatabaseServiceProvider);
        app.boot();
        Facade.setApplication(app);

        dbManager = app.make("db");
        const schema = dbManager.schema();

        await schema.dropIfExists("orders");
        await schema.create("orders", t => {
            t.string("id").primary();
            t.string("title");
        });
    });

    afterEach(async () => {
        if (dbManager) {
            await dbManager.disconnect();
        }
    });

    test("UuidsPlugin generates UUID v4 string automatically on model creation", async () => {
        class Order extends Model {
            static table = "orders";
        }
        Order.use(UuidsPlugin);

        const order = new Order({ title: "Order #1" });
        await order.save();

        assert.ok(order.getAttribute("id"));
        assert.equal(order.getAttribute("id").length, 36);
    });

    test("UuidsPlugin supports UUID v7 time-ordered strategy", async () => {
        class OrderV7 extends Model {
            static table = "orders";
        }
        OrderV7.use(new UuidsPlugin({ strategy: "v7" }));

        const order = new OrderV7({ title: "Order #2" });
        await order.save();

        const uuid = order.getAttribute("id");
        assert.ok(uuid);
        assert.equal(uuid.length, 36);
        assert.equal(uuid.charAt(14), "7"); // Verify version 7 character
    });
});
