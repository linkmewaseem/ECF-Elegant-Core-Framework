import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Application } from "@ecf/core";
import {
  ConfigRepository,
  ConfigEncrypter,
  ConfigServiceProvider,
  Config,
} from "../src/index.js";

describe("@ecf/config — Enterprise Configuration Platform Tests", () => {

  test("ConfigRepository dot-notation access and typed accessors", () => {
    const config = new ConfigRepository({
      app: { name: "ECF", debug: "true", port: "8080", mailers: ["smtp"] }
    });

    assert.equal(config.get("app.name"), "ECF");
    assert.equal(config.boolean("app.debug"), true);
    assert.equal(config.number("app.port"), 8080);
    assert.deepEqual(config.array("app.mailers"), ["smtp"]);
  });

  test("Runtime config mutations (set, push, prepend, merge)", () => {
    const config = new ConfigRepository();
    config.set("db.host", "127.0.0.1");
    assert.equal(config.get("db.host"), "127.0.0.1");

    config.push("queue.drivers", "redis");
    assert.deepEqual(config.get("queue.drivers"), ["redis"]);

    config.prepend("queue.drivers", "sync");
    assert.deepEqual(config.get("queue.drivers"), ["sync", "redis"]);
  });

  test("ConfigEncrypter AES-256-GCM encryption & decryption", () => {
    const secretKey = "super-secret-key-123";
    const raw = "DB_PASSWORD_SECRET";
    const encrypted = ConfigEncrypter.encrypt(raw, secretKey);
    
    assert.ok(encrypted.includes(":"));
    const decrypted = ConfigEncrypter.decrypt(encrypted, secretKey);
    assert.equal(decrypted, raw);
  });

  test("ConfigServiceProvider IoC binding & Facade integration", () => {
    const app = new Application();
    app.register(ConfigServiceProvider);
    app.boot();

    Config.setApplication(app);
    Config.set("site.url", "https://ecf.dev");
    assert.equal(Config.get("site.url"), "https://ecf.dev");
  });

});
