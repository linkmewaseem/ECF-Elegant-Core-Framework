import fs from 'node:fs';
import path from 'node:path';

/**
 * Stub Template Compiler.
 * Compiles stubs with variable interpolation, respecting published stubs/ overrides.
 */
export class StubCompiler {
  constructor({ customStubsDir = './stubs' } = {}) {
    this.customStubsDir = customStubsDir;
  }

  /**
   * Compile template content replacing {{variable}} tokens.
   * @param {string} template
   * @param {Record<string, string>} variables
   * @returns {string}
   */
  compileString(template, variables = {}) {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value ?? '');
    }
    return result;
  }

  /**
   * Load and compile stub file.
   * @param {string} stubName
   * @param {string} defaultStubContent
   * @param {Record<string, string>} variables
   * @returns {string}
   */
  compileStub(stubName, defaultStubContent, variables = {}) {
    let template = defaultStubContent;

    const customPath = path.join(this.customStubsDir, `${stubName}.stub`);
    if (fs.existsSync(customPath)) {
      template = fs.readFileSync(customPath, 'utf-8');
    }

    return this.compileString(template, variables);
  }
}

export default StubCompiler;
