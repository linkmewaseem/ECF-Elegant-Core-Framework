import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Application } from "@ecfjs/core";
import {
  Command,
  ConsoleKernel,
  SignatureParser,
  CommandResult,
  ConsoleServiceProvider,
} from "../src/index.js";

class SendEmailsCommand extends Command {
  signature = "emails:send {user : User ID} {--force : Force send}";
  description = "Send emails to a targeted user";
  category = "mail";

  async handle() {
    const user = this.argument("user");
    const force = this.option("force");
    return CommandResult.success(`Sent to user ${user} (force: ${force})`);
  }
}

describe("@ecfjs/console — Enterprise Command Framework Tests", () => {

  test("SignatureParser parses command signatures correctly", () => {
    const parsed = SignatureParser.parse("users:get {id : User ID} {--active}");
    assert.equal(parsed.name, "users:get");
    assert.equal(parsed.arguments.length, 1);
    assert.equal(parsed.arguments[0].name, "id");
    assert.equal(parsed.options.length, 1);
    assert.equal(parsed.options[0].name, "active");
  });

  test("ConsoleKernel registers, boots, and executes commands", async () => {
    const kernel = new ConsoleKernel();
    kernel.register(SendEmailsCommand);

    const result = await kernel.run(["emails:send", "42", "--force"]);
    assert.equal(result.status, "success");
    assert.equal(result.exitCode, 0);
  });

  test("ConsoleKernel supports lifecycle before/after hooks", async () => {
    const kernel = new ConsoleKernel();
    kernel.register(SendEmailsCommand);

    let beforeCalled = false;
    let afterCalled = false;

    kernel.before((cmd) => {
      beforeCalled = true;
      assert.equal(cmd.name, "emails:send");
    });

    kernel.after((cmd, res) => {
      afterCalled = true;
      assert.equal(res.status, "success");
    });

    await kernel.run(["emails:send", "99"]);
    assert.equal(beforeCalled, true);
    assert.equal(afterCalled, true);
  });

  test("ConsoleServiceProvider binds console.kernel in IoC container", () => {
    const app = new Application();
    app.register(ConsoleServiceProvider);
    app.boot();

    const kernel = app.make("console.kernel");
    assert.ok(kernel instanceof ConsoleKernel);
  });

});
