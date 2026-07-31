import { SignatureParser } from './SignatureParser.js';

/**
 * Registry and Auto-Discovery for ECF CLI Commands.
 */
export class CommandRegistry {
  constructor() {
    this.commands = new Map();
  }

  register(CommandClass) {
    const instance = typeof CommandClass === 'function' ? new CommandClass() : CommandClass;
    const parsed = SignatureParser.parse(instance.signature);
    this.commands.set(parsed.name, { CommandClass, instance, parsed });
    return this;
  }

  get(name) {
    return this.commands.get(name) || null;
  }

  has(name) {
    return this.commands.has(name);
  }

  all() {
    return Array.from(this.commands.values());
  }
}
