import SignatureParser from "./SignatureParser.js";

export class CommandRegistry {
  constructor() {
    this.commands = new Map();
  }

  register(CommandClassOrInstance) {
    let instance;
    if (typeof CommandClassOrInstance === "function") {
      instance = new CommandClassOrInstance();
    } else {
      instance = CommandClassOrInstance;
    }

    if (instance.signature && !instance.parsedSignature) {
      instance.parsedSignature = SignatureParser.parse(instance.signature);
    }

    const name = instance.name;
    this.commands.set(name, {
      command: instance,
      classRef: typeof CommandClassOrInstance === "function" ? CommandClassOrInstance : instance.constructor,
    });
  }

  has(name) {
    return this.commands.has(name);
  }

  get(name) {
    const entry = this.commands.get(name);
    return entry ? entry.command : null;
  }

  all() {
    const list = {};
    for (const [name, entry] of this.commands.entries()) {
      list[name] = entry.command;
    }
    return list;
  }

  getVisible() {
    const result = {};
    for (const [name, entry] of this.commands.entries()) {
      if (!entry.command.hidden) {
        result[name] = entry.command;
      }
    }
    return result;
  }

  getCategorized() {
    const categories = {};
    for (const [name, entry] of this.commands.entries()) {
      if (entry.command.hidden) continue;
      const cat = entry.command.category || "system";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(entry.command);
    }
    return categories;
  }
}

export default CommandRegistry;
