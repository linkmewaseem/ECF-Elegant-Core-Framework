import fs from 'node:fs';
import path from 'node:path';
import { StubCompiler } from './StubCompiler.js';

export class CodeGenerator {
  /**
   * Generate code file from a stub.
   * @param {string} targetType
   * @param {object} variables { name, class, namespace, ... }
   * @param {object} [options] { dryRun: false, force: false, basePath: process.cwd() }
   * @returns {{ targetPath: string, content: string, written: boolean }}
   */
  static generate(targetType, variables, options = {}) {
    const { dryRun = false, force = false, basePath = process.cwd() } = options;

    const name = variables.name;
    const className = name.charAt(0).toUpperCase() + name.slice(1);
    const vars = {
      name,
      class: className,
      className,
      ...variables
    };

    let relativePath = '';
    let stubContent = '';

    switch (targetType) {
      case 'controller':
        relativePath = `app/Http/Controllers/${className}Controller.js`;
        stubContent = `import { Controller } from './Controller.js';

export class {{ className }}Controller extends Controller {
{{#if isResource}}
  async index(req, res) { return res.json([]); }
  async show(req, res) { return res.json({}); }
  async store(req, res) { return res.json({ status: 'created' }); }
  async update(req, res) { return res.json({ status: 'updated' }); }
  async destroy(req, res) { return res.json({ status: 'deleted' }); }
{{/if}}
}

export default {{ className }}Controller;
`;
        break;

      case 'model':
        relativePath = `app/Models/${className}.js`;
        stubContent = `import { Model } from '../../database/src/index.js';

export class {{ className }} extends Model {
  static table = '{{ name }}s';
  static primaryKey = 'id';
}

export default {{ className }};
`;
        break;

      case 'middleware':
        relativePath = `app/Http/Middleware/${className}.js`;
        stubContent = `export class {{ className }} {
  async handle(request, next) {
    return next(request);
  }
}

export default {{ className }};
`;
        break;

      case 'request':
        relativePath = `app/Http/Requests/${className}Request.js`;
        stubContent = `import { FormRequest } from '../../../../http/src/index.js';

export class {{ className }}Request extends FormRequest {
  rules() {
    return {
      // Validation rules
    };
  }
}

export default {{ className }}Request;
`;
        break;

      case 'policy':
        relativePath = `app/Policies/${className}Policy.js`;
        stubContent = `import { Policy } from '../../../http/src/index.js';

export class {{ className }}Policy extends Policy {
  async view(user, resource) {
    return true;
  }
}

export default {{ className }}Policy;
`;
        break;

      default:
        relativePath = `app/${className}.js`;
        stubContent = `export class {{ className }} {}\nexport default {{ className }};\n`;
    }

    const content = StubCompiler.compile(stubContent, vars);
    const targetPath = path.join(basePath, relativePath);

    if (dryRun) {
      return { targetPath, content, written: false };
    }

    if (fs.existsSync(targetPath) && !force) {
      throw new Error(`File already exists at ${targetPath}. Use --force to overwrite.`);
    }

    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(targetPath, content, 'utf-8');
    return { targetPath, content, written: true };
  }
}
