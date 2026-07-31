export class Macroable {
  static macros = new Map();

  static macro(name, fn) {
    this.macros.set(name, fn);
  }

  static hasMacro(name) {
    return this.macros.has(name);
  }
}

export default Macroable;
