/**
 * Parses Laravel-style command signatures:
 * Example: "make:model {name} {--migration} {--factory} {--seed} {--force}"
 */
export class SignatureParser {
  /**
   * Parse command signature string.
   * @param {string} signatureString
   * @returns {{ name: string, arguments: object[], options: object[] }}
   */
  static parse(signatureString) {
    if (!signatureString || typeof signatureString !== 'string') {
      throw new Error('Signature parser requires a non-empty string.');
    }

    const tokens = signatureString.trim().split(/\s+/);
    const commandName = tokens[0];

    const args = [];
    const options = [];

    for (let i = 1; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.startsWith('{') && token.endsWith('}')) {
        const raw = token.slice(1, -1).trim();
        if (raw.startsWith('--')) {
          // Option
          const optionName = raw.slice(2).split('=')[0];
          const hasValue = raw.includes('=');
          options.push({
            name: optionName,
            hasValue,
            defaultValue: hasValue ? raw.split('=')[1] : false
          });
        } else {
          // Argument
          const argName = raw.split('=')[0];
          const isOptional = raw.endsWith('?');
          const cleanName = argName.replace(/\?$/, '');
          args.push({
            name: cleanName,
            isOptional,
            defaultValue: raw.includes('=') ? raw.split('=')[1] : null
          });
        }
      }
    }

    return {
      name: commandName,
      arguments: args,
      options
    };
  }
}
