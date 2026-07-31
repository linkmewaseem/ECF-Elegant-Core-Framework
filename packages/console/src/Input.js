export class Input {
  constructor(argv = process.argv.slice(2)) {
    this.rawArgv = argv;
    this.arguments = {};
    this.options = {};
    this.commandName = null;

    this.parse();
  }

  parse() {
    const positional = [];

    for (let i = 0; i < this.rawArgv.length; i++) {
      const arg = this.rawArgv[i];

      if (arg.startsWith("--")) {
        const [optKey, ...optValParts] = arg.slice(2).split("=");
        if (optValParts.length > 0) {
          this.options[optKey] = optValParts.join("=");
        } else {
          // Check if next arg is value or flag
          const next = this.rawArgv[i + 1];
          if (next && !next.startsWith("-")) {
            this.options[optKey] = next;
            i++;
          } else {
            this.options[optKey] = true;
          }
        }
      } else if (arg.startsWith("-")) {
        const optKey = arg.slice(1);
        this.options[optKey] = true;
      } else {
        if (!this.commandName) {
          this.commandName = arg;
        } else {
          positional.push(arg);
        }
      }
    }

    this.positional = positional;
  }

  argument(key, defaultValue = null) {
    if (typeof key === "number") {
      return this.positional[key] !== undefined ? this.positional[key] : defaultValue;
    }
    return this.arguments[key] !== undefined ? this.arguments[key] : defaultValue;
  }

  option(key, defaultValue = null) {
    return this.options[key] !== undefined ? this.options[key] : defaultValue;
  }

  hasOption(key) {
    return key in this.options;
  }
}

export default Input;
