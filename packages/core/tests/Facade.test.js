import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import Application from "../src/Application.js";
import Facade from "../src/Facade.js";
import ConfigServiceProvider from "../src/providers/ConfigServiceProvider.js";
import Config from "../src/facade/Config.js";

describe("Config Facade - full integration", () => {

    beforeEach(() => {
        // Har test se pehle fresh app banao taaki tests isolated rahein
        const app = new Application();
        app.register(ConfigServiceProvider);
        app.boot();
        Facade.setApplication(app);
    });

    test("Config.set() and Config.get() should work through the facade", () => {
        Config.set("app.name", "ECF");
        assert.equal(Config.get("app.name"), "ECF");
    });

    test("Config facade should return same singleton instance across calls", () => {
        Config.set("app.env", "production");

        // Dubara get karne pe same underlying instance se aana chahiye
        assert.equal(Config.get("app.env"), "production");
    });

    test("Config.get() should return defaultValue for missing keys", () => {
        assert.equal(Config.get("missing.key", "fallback"), "fallback");
    });

    test("Config facade should throw if Facade.app is not set", () => {
        Facade.setApplication(null); // reset

        assert.throws(() => {
            Config.get("app.name");
        }); // this.app.make() will throw because this.app is null
    });

});