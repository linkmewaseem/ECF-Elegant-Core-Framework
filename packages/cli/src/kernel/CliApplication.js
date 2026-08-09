import { CommandRegistry } from './CommandRegistry.js';
import { Input } from './Input.js';
import { Output } from '../output/Output.js';

export class CliApplication {
  constructor(name = 'ECF CLI Framework', version = '1.0.0-alpha.1') {
    this.name = name;
    this.version = version;
    this.registry = new CommandRegistry();
    this.output = new Output();
  }

  register(CommandClass) {
    this.registry.register(CommandClass);
    return this;
  }

  async run(argv = process.argv.slice(2)) {
    if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
      this.renderHelp();
      return 0;
    }

    if (argv.includes('--version') || argv.includes('-V')) {
      this.output.line(`${this.name} v${this.version}`);
      return 0;
    }

    const commandName = argv[0];
    const registered = this.registry.get(commandName);

    if (!registered) {
      this.output.error(`Command "${commandName}" is not registered.`);
      this.renderHelp();
      return 1;
    }

    const { instance, parsed } = registered;

    // Extract arguments and options
    const args = {};
    const options = {};
    const rawArgs = argv.slice(1);

    let argIdx = 0;
    for (const token of rawArgs) {
      if (token.startsWith('--')) {
        const [optKey, optVal] = token.slice(2).split('=');
        options[optKey] = optVal !== undefined ? optVal : true;
      } else if (argIdx < parsed.arguments.length) {
        const argSpec = parsed.arguments[argIdx];
        args[argSpec.name] = token;
        argIdx++;
      }
    }

    // Set default values for missing arguments
    for (const argSpec of parsed.arguments) {
      if (!Object.prototype.hasOwnProperty.call(args, argSpec.name)) {
        args[argSpec.name] = argSpec.defaultValue;
      }
    }

    const input = new Input(args, options, rawArgs);

    try {
      await instance.handle(input, this.output);
      return 0;
    } catch (err) {
      this.output.error(`Command failed: ${err.message}`);
      return 1;
    }
  }

  renderHelp() {
    this.output.box(this.name, `Version: ${this.version}`);
    this.output.line('\n\x1b[1mAvailable Commands:\x1b[0m');
    for (const item of this.registry.all()) {
      this.output.line(`  \x1b[32m${item.parsed.name.padEnd(25)}\x1b[0m ${item.instance.description}`);
    }
    this.output.line('');
  }
}
