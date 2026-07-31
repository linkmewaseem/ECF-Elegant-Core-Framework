import CommandRegistry from "./CommandRegistry.js";
import CommandBus from "./CommandBus.js";
import Input from "./Input.js";
import LockManager from "./LockManager.js";
import SignalHandler from "./SignalHandler.js";
import CommandResult from "./CommandResult.js";

export class ConsoleKernel {
  constructor(app = null) {
    this.app = app;
    this.registry = new CommandRegistry();
    this.bus = new CommandBus(app ? app.container : null);
    this.lockManager = new LockManager();
    this.signalHandler = new SignalHandler();
    
    this.beforeHooks = [];
    this.afterHooks = [];
    this.failedHooks = [];

    this.booted = false;
    this.scheduledTasks = [];
  }

  async boot() {
    if (this.booted) return;
    this.booted = true;

    this.signalHandler.onShutdown(() => {
      this.terminate();
    });
  }

  register(CommandClassOrInstance) {
    this.registry.register(CommandClassOrInstance);
    return this;
  }

  before(fn) {
    this.beforeHooks.push(fn);
    return this;
  }

  after(fn) {
    this.afterHooks.push(fn);
    return this;
  }

  failed(fn) {
    this.failedHooks.push(fn);
    return this;
  }

  schedule(commandName) {
    const task = {
      command: commandName,
      expression: "* * * * *",
      everyMinute() { this.expression = "* * * * *"; return this; },
      hourly() { this.expression = "0 * * * *"; return this; },
      daily() { this.expression = "0 0 * * *"; return this; },
      cron(expr) { this.expression = expr; return this; }
    };
    this.scheduledTasks.push(task);
    return task;
  }

  async run(argv = process.argv.slice(2)) {
    await this.boot();

    const input = new Input(argv);
    const commandName = input.commandName || "list";

    if (commandName === "list" || input.hasOption("help")) {
      return this.renderHelp();
    }

    const command = this.registry.get(commandName);
    if (!command) {
      console.error(`Command [${commandName}] not found.`);
      return CommandResult.failed(`Command [${commandName}] not found.`, 127);
    }

    // Lock Manager protection if command has lock
    if (command.isolate) {
      const acquired = this.lockManager.acquire(command.name);
      if (!acquired) {
        console.warn(`Command [${command.name}] is already running in another process.`);
        return CommandResult.skipped(`Command [${command.name}] is locked.`);
      }
    }

    try {
      // Event: CommandStarting / Before hooks
      for (const hook of this.beforeHooks) {
        await hook(command, input);
      }

      // Execute Middleware Pipeline
      for (const mw of command.middleware) {
        if (typeof mw === "function") {
          let allowed = false;
          await mw(input, () => { allowed = true; });
          if (!allowed) {
            return CommandResult.failed("Middleware blocked command execution.", 1);
          }
        }
      }

      // Dispatch via CommandBus
      const result = await this.bus.dispatch(command, input);

      // Event: CommandFinished / After hooks
      for (const hook of this.afterHooks) {
        await hook(command, result);
      }

      return result;
    } catch (err) {
      // Event: CommandFailed / Failed hooks
      for (const hook of this.failedHooks) {
        await hook(command, err);
      }
      console.error(`Command [${command.name}] error:`, err.message);
      return CommandResult.failed(err.message, 1);
    } finally {
      if (command.isolate) {
        this.lockManager.release(command.name);
      }
      this.terminate();
    }
  }

  renderHelp() {
    console.log(`\n\x1b[36mECF Console Application\x1b[0m\n`);
    const categorized = this.registry.getCategorized();

    for (const [category, commands] of Object.entries(categorized)) {
      console.log(` \x1b[33m${category.toUpperCase()}\x1b[0m`);
      for (const cmd of commands) {
        console.log(`  \x1b[32m${cmd.name.padEnd(24)}\x1b[0m ${cmd.description || ""}`);
      }
      console.log();
    }

    return CommandResult.success();
  }

  terminate() {
    // Release resources or signal hooks
  }
}

export default ConsoleKernel;
