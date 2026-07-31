/**
 * Mini Template Compiler for Generator Stubs.
 */
export class StubCompiler {
  /**
   * Compile stub string replacing variables and conditionals.
   * @param {string} stubContent
   * @param {object} variables
   * @returns {string}
   */
  static compile(stubContent, variables = {}) {
    let output = stubContent;

    // Process conditional blocks: {{#if key}}...{{/if}}
    output = output.replace(/\{\{#if\s+([a-zA-Z0-9_]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, body) => {
      return Boolean(variables[key]) ? body : '';
    });

    // Replace variables: {{ key }}
    output = output.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
      return Object.prototype.hasOwnProperty.call(variables, key) ? String(variables[key]) : match;
    });

    return output;
  }
}
