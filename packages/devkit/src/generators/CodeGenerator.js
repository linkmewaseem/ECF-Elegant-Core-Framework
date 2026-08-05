import fs from 'node:fs';
import path from 'node:path';
import { ICodeGenerator } from '@ecfjs/contracts';
import { StubCompiler } from './StubCompiler.js';

/**
 * Base Code Generator Class.
 */
export class CodeGenerator extends ICodeGenerator {
  constructor(options = {}) {
    super();
    this.options = options;
    this.stubCompiler = new StubCompiler({ customStubsDir: options.customStubsDir || './stubs' });
    this.history = [];
  }

  async beforeGenerate(options) {}
  async afterGenerate(options, result) {}
  async beforeWrite(targetPath, content) {}
  async afterWrite(targetPath, content) {}

  /**
   * Helper to format names.
   */
  formatNames(name) {
    const pascal = name.charAt(0).toUpperCase() + name.slice(1);
    const camel = name.charAt(0).toLowerCase() + name.slice(1);
    const kebab = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    const snake = name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    const plural = name.endsWith('y') ? name.slice(0, -1) + 'ies' : name + 's';
    return { pascal, camel, kebab, snake, plural, lower: name.toLowerCase() };
  }

  /**
   * Safely write output file with dry-run, force, skip, and merge handling.
   * @param {string} targetPath
   * @param {string} content
   * @param {Object} [writeOptions]
   * @returns {Promise<Object>}
   */
  async writeFile(targetPath, content, writeOptions = {}) {
    const isDry = writeOptions.dry ?? this.options.dry ?? false;
    const isForce = writeOptions.force ?? this.options.force ?? false;
    const isSkip = writeOptions.skip ?? this.options.skip ?? false;
    const isMerge = writeOptions.merge ?? this.options.merge ?? false;

    await this.beforeWrite(targetPath, content);

    const exists = fs.existsSync(targetPath);

    if (exists && isSkip) {
      return { status: 'SKIPPED', path: targetPath, content };
    }

    if (exists && !isForce && !isMerge) {
      return { status: 'EXISTS', path: targetPath, content };
    }

    let finalContent = content;
    if (exists && isMerge) {
      const existing = fs.readFileSync(targetPath, 'utf-8');
      finalContent = existing.trim() + '\n\n' + content.trim() + '\n';
    }

    if (isDry) {
      return { status: 'DRY_RUN', path: targetPath, content: finalContent };
    }

    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(targetPath, finalContent, 'utf-8');
    this.history.push({ path: targetPath, action: exists ? 'MODIFIED' : 'CREATED' });

    await this.afterWrite(targetPath, finalContent);

    return { status: exists ? 'MODIFIED' : 'CREATED', path: targetPath, content: finalContent };
  }
}

export default CodeGenerator;
