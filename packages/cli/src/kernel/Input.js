/**
 * Parsed CLI Input abstraction.
 */
export class Input {
  /**
   * @param {object} args
   * @param {object} options
   * @param {string[]} rawTokens
   */
  constructor(args = {}, options = {}, rawTokens = []) {
    this.args = args;
    this.opts = options;
    this.rawTokens = rawTokens;
  }

  argument(name, defaultValue = null) {
    return Object.prototype.hasOwnProperty.call(this.args, name) ? this.args[name] : defaultValue;
  }

  option(name, defaultValue = false) {
    return Object.prototype.hasOwnProperty.call(this.opts, name) ? this.opts[name] : defaultValue;
  }

  hasOption(name) {
    return Object.prototype.hasOwnProperty.call(this.opts, name);
  }
}
