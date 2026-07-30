import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Application, Facade } from "@ecf/core";
import DatabaseServiceProvider from "../src/providers/DatabaseServiceProvider.js";
import Model from "../src/orm/Model.js";
import Plugin from "../src/orm/extensions/Plugin.js";

describe("Milestone 6 — ECF Extension Platform v2 Integration Tests", () => {
    let app;
    let dbManager;

    beforeEach(async () => {
        app = new Application();
        app.register(DatabaseServiceProvider);
        app.boot();
        Facade.setApplication(app);

        dbManager = app.make("db");
        const schema = dbManager.schema();

        await schema.dropIfExists("users");
        await schema.create("users", t => {
            t.id();
            t.string("name");
        });
    });

    afterEach(async () => {
        if (dbManager) {
            await dbManager.disconnect();
        }
    });

    test("4-Stage Lifecycle Execution (register -> boot -> ready -> shutdown)", async () => {
        const lifecycleLog = [];

        class LifecyclePlugin extends Plugin {
            manifest = {
                name: "lifecycle-plugin",
                version: "1.0.0"
            };

            async register(ctx) {
                lifecycleLog.push("register");
                ctx.storage.set("stage", "registered");
            }

            async boot(ctx) {
                lifecycleLog.push("boot");
                ctx.storage.set("stage", "booted");
            }

            async ready(ctx) {
                lifecycleLog.push("ready");
            }

            async shutdown(ctx) {
                lifecycleLog.push("shutdown");
            }
        }

        class User1 extends Model {
            static table = "users";
        }

        User1.use(new LifecyclePlugin());
        await User1.all(); // Triggers bootIfNeeded()

        assert.deepEqual(lifecycleLog, ["register", "boot", "ready"]);
        assert.equal(User1.plugins().length, 1);
        assert.equal(User1.plugins()[0].name, "lifecycle-plugin");

        await User1.uninstall("lifecycle-plugin");
        assert.ok(lifecycleLog.includes("shutdown"));
        assert.equal(User1.plugins().length, 0);
    });

    test("Capability Dependency Matching & Injected Context Resolution (context.use)", async () => {
        class CacheProviderPlugin extends Plugin {
            manifest = {
                name: "cache-provider",
                provides: {
                    cache: {
                        version: "1.0.0",
                        methods: ["remember"]
                    }
                }
            };

            remember(key, callback) {
                return callback();
            }
        }

        const consumerLog = [];

        class CacheConsumerPlugin extends Plugin {
            manifest = {
                name: "cache-consumer",
                requires: {
                    cache: ">=1.0.0"
                }
            };

            async boot(ctx) {
                const cachePlugin = ctx.use("cache");
                assert.ok(cachePlugin);
                const value = cachePlugin.remember("key", () => "computed_val");
                consumerLog.push(`consumer_received:${value}`);
            }
        }

        class User2 extends Model {
            static table = "users";
        }

        User2.use(new CacheProviderPlugin());
        User2.use(new CacheConsumerPlugin());

        await User2.all();

        assert.deepEqual(consumerLog, ["consumer_received:computed_val"]);
        const caps = User2.capabilities();
        assert.ok(caps.cache);
        assert.equal(caps.cache.provider, "cache-provider");
    });

    test("Isolated Sandboxed PluginStorage", async () => {
        let pluginAStorageVal;

        class PluginA extends Plugin {
            manifest = { name: "plugin-a" };
            async boot(ctx) {
                ctx.storage.set("token", "secret_a");
                pluginAStorageVal = ctx.storage.get("token");
            }
        }

        class PluginB extends Plugin {
            manifest = { name: "plugin-b" };
            async boot(ctx) {
                assert.equal(ctx.storage.get("token"), undefined);
            }
        }

        class User3 extends Model {
            static table = "users";
        }

        User3.use(new PluginA());
        User3.use(new PluginB());

        await User3.all();

        assert.equal(pluginAStorageVal, "secret_a");
    });

    test("Fault-Tolerant Plugin Recovery (unhandled boot exception isolation)", async () => {
        class BrokenPlugin extends Plugin {
            manifest = { name: "broken-plugin" };
            async boot() {
                throw new Error("Simulated Boot Crash");
            }
        }

        class HealthyPlugin extends Plugin {
            manifest = { name: "healthy-plugin" };
            async boot(ctx) {
                ctx.storage.set("status", "healthy_ok");
            }
        }

        class User4 extends Model {
            static table = "users";
        }

        User4.use(new BrokenPlugin());
        User4.use(new HealthyPlugin());

        // Process should NOT crash when boot is called!
        await User4.all();

        const doctor = await User4.pluginDoctor();
        assert.equal(doctor.length, 2);

        const brokenStatus = doctor.find(d => d.name === "broken-plugin");
        assert.equal(brokenStatus.healthy, false);
        assert.equal(brokenStatus.status, "unhealthy");
        assert.ok(brokenStatus.message.includes("Simulated Boot Crash"));

        const healthyStatus = doctor.find(d => d.name === "healthy-plugin");
        assert.equal(healthyStatus.healthy, true);
    });

    test("Feature Discovery Introspection APIs (plugins, capabilities, doctor, metrics, extensionGraph)", async () => {
        class DummyPlugin extends Plugin {
            manifest = {
                name: "dummy",
                type: "orm",
                priorityGroup: "EARLY",
                priority: 5
            };
        }

        class User5 extends Model {
            static table = "users";
        }

        User5.use(new DummyPlugin());
        await User5.all();

        const pluginsList = User5.plugins();
        assert.equal(pluginsList[0].name, "dummy");
        assert.equal(pluginsList[0].priorityGroup, "EARLY");
        assert.equal(pluginsList[0].priority, 5);

        const graph = User5.extensionGraph();
        assert.ok(graph.dummy);

        const doctor = await User5.pluginDoctor();
        assert.equal(doctor[0].healthy, true);

        const metrics = User5.pluginMetrics("dummy");
        assert.ok(metrics.calls >= 1);
    });
});
