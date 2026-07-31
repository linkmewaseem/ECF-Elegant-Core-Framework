import CommandResult from "./CommandResult.js";

export class CommandBus {
  constructor(container = null) {
    this.container = container;
  }

  async dispatch(commandInstance, input) {
    commandInstance.input = input;

    // IoC Method Injection on handle()
    let handleArgs = [];
    if (this.container && typeof commandInstance.handle === "function") {
      const paramNames = this.getParamNames(commandInstance.handle);
      handleArgs = paramNames.map((param) => {
        if (this.container.has(param)) {
          return this.container.make(param);
        }
        return null;
      });
    }

    const result = await commandInstance.handle(...handleArgs);

    if (result instanceof CommandResult) {
      return result;
    }
    if (typeof result === "number") {
      return result === 0 ? CommandResult.success() : CommandResult.failed("Exit code " + result, result);
    }

    return CommandResult.success("Command completed", { result });
  }

  getParamNames(fn) {
    const fnStr = fn.toString().replace(/[/][/].*$/mg, '').replace(/\s+/g, '');
    const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^,]+)/g);
    return result === null ? [] : result;
  }
}

export default CommandBus;
