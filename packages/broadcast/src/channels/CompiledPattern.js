export class CompiledPattern {
  constructor(pattern) {
    this.pattern = pattern;
    this.paramNames = [];
    this.regex = this.compile(pattern);
  }

  compile(pattern) {
    const escaped = pattern.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, (match) => {
      if (match === "{" || match === "}") return match;
      return `\\${match}`;
    });

    const regexStr = escaped.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, paramName) => {
      this.paramNames.push(paramName);
      return "([^./]+)";
    });

    return new RegExp(`^${regexStr}$`);
  }

  match(channelName) {
    const match = channelName.match(this.regex);
    if (!match) return null;

    const params = {};
    for (let i = 0; i < this.paramNames.length; i++) {
      params[this.paramNames[i]] = match[i + 1];
    }
    return params;
  }
}

export default CompiledPattern;
