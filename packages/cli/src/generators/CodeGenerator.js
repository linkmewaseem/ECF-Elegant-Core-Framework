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
      case 'controller': {
        const cleanName = className.replace(/Controller$/i, '');
        const ctrlClass = `${cleanName}Controller`;
        relativePath = `app/Http/Controllers/${ctrlClass}.js`;
        stubContent = `import { Controller } from './Controller.js';

export class {{ ctrlClass }} extends Controller {
{{#if isResource}}
  async index(req, res) { return res.json([]); }
  async show(req, res) { return res.json({}); }
  async store(req, res) { return res.json({ status: 'created' }); }
  async update(req, res) { return res.json({ status: 'updated' }); }
  async destroy(req, res) { return res.json({ status: 'deleted' }); }
{{else}}
  async index(req, res) {
    return res.json({ message: 'Hello from {{ ctrlClass }}' });
  }
{{/if}}
}

export default {{ ctrlClass }};
`;
        vars.ctrlClass = ctrlClass;
        break;
      }

      case 'model': {
        const modelClass = className.replace(/Model$/i, '');
        relativePath = `app/Models/${modelClass}.js`;
        stubContent = `import { Model } from '@ecfjs/database';

export class {{ modelClass }} extends Model {
  static table = '{{ tableName }}s';
  static primaryKey = 'id';
}

export default {{ modelClass }};
`;
        vars.modelClass = modelClass;
        vars.tableName = (variables.table || modelClass).toLowerCase();
        break;
      }

      case 'middleware': {
        const midClass = className.replace(/Middleware$/i, '') + 'Middleware';
        relativePath = `app/Http/Middleware/${midClass}.js`;
        stubContent = `export class {{ midClass }} {
  async handle(request, next) {
    return next(request);
  }
}

export default {{ midClass }};
`;
        vars.midClass = midClass;
        break;
      }

      case 'request': {
        const reqClass = className.replace(/Request$/i, '') + 'Request';
        relativePath = `app/Http/Requests/${reqClass}.js`;
        stubContent = `import { FormRequest } from '@ecfjs/http';

export class {{ reqClass }} extends FormRequest {
  rules() {
    return {
      // Validation rules
    };
  }
}

export default {{ reqClass }};
`;
        vars.reqClass = reqClass;
        break;
      }

      case 'policy': {
        const polClass = className.replace(/Policy$/i, '') + 'Policy';
        relativePath = `app/Policies/${polClass}.js`;
        stubContent = `import { Policy } from '@ecfjs/http';

export class {{ polClass }} extends Policy {
  async view(user, resource) {
    return true;
  }
}

export default {{ polClass }};
`;
        vars.polClass = polClass;
        break;
      }

      case 'command': {
        const cmdClass = className.replace(/Command$/i, '') + 'Command';
        relativePath = `app/Console/Commands/${cmdClass}.js`;
        stubContent = `import { Command } from '@ecfjs/cli';

export class {{ cmdClass }} extends Command {
  constructor() {
    super();
    this.signature = '{{ cmdName }}';
    this.description = 'Custom CLI command';
  }

  async handle(input, output) {
    output.success('Command {{ cmdClass }} executed successfully.');
  }
}

export default {{ cmdClass }};
`;
        vars.cmdClass = cmdClass;
        vars.cmdName = (variables.signature || className).toLowerCase();
        break;
      }

      case 'migration': {
        const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
        const snakeName = name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
        relativePath = `database/migrations/${timestamp}_${snakeName}.js`;

        // Extract the actual table name from patterns like:
        //   create_users_table  → users
        //   create_posts_table  → posts
        //   add_email_to_users  → users (fallback: snakeName)
        const tableMatch = snakeName.match(/^create_(.+?)_table$/);
        const tableName = tableMatch ? tableMatch[1] : snakeName;

        stubContent = `import { Schema } from '@ecfjs/database';

export class {{ className }} {
  async up() {
    await Schema.create('{{ tableName }}', (table) => {
      table.id();
      table.timestamps();
    });
  }

  async down() {
    await Schema.dropIfExists('{{ tableName }}');
  }
}

export default {{ className }};
`;
        vars.snakeName = snakeName;
        vars.tableName = tableName;
        break;
      }

      case 'seeder': {
        const seedClass = className.replace(/Seeder$/i, '') + 'Seeder';
        relativePath = `database/seeders/${seedClass}.js`;
        stubContent = `export class {{ seedClass }} {
  async run() {
    // Seed database records here
  }
}

export default {{ seedClass }};
`;
        vars.seedClass = seedClass;
        break;
      }

      case 'job': {
        const jobClass = className.replace(/Job$/i, '') + 'Job';
        relativePath = `app/Jobs/${jobClass}.js`;
        stubContent = `export class {{ jobClass }} {
  async handle() {
    // Process background queue job
  }
}

export default {{ jobClass }};
`;
        vars.jobClass = jobClass;
        break;
      }

      case 'mail': {
        const mailClass = className.replace(/Mail$/i, '') + 'Mail';
        relativePath = `app/Mail/${mailClass}.js`;
        stubContent = `export class {{ mailClass }} {
  async build() {
    return {
      subject: 'Notification Mail',
      html: '<h1>Notification</h1>'
    };
  }
}

export default {{ mailClass }};
`;
        vars.mailClass = mailClass;
        break;
      }

      case 'notification': {
        const notifClass = className.replace(/Notification$/i, '') + 'Notification';
        relativePath = `app/Notifications/${notifClass}.js`;
        stubContent = `export class {{ notifClass }} {
  via(notifiable) {
    return ['mail', 'database'];
  }

  toMail(notifiable) {
    return { subject: 'Notification', body: 'You have a new message.' };
  }
}

export default {{ notifClass }};
`;
        vars.notifClass = notifClass;
        break;
      }

      case 'channel': {
        const chanClass = className.replace(/Channel$/i, '') + 'Channel';
        relativePath = `app/Broadcasting/${chanClass}.js`;
        stubContent = `export class {{ chanClass }} {
  join(user, id) {
    return true;
  }
}

export default {{ chanClass }};
`;
        vars.chanClass = chanClass;
        break;
      }

      case 'resource': {
        const resClass = className.replace(/Resource$/i, '') + 'Resource';
        relativePath = `app/Http/Resources/${resClass}.js`;
        stubContent = `export class {{ resClass }} {
  toArray(request) {
    return {
      // Resource mappings
    };
  }
}

export default {{ resClass }};
`;
        vars.resClass = resClass;
        break;
      }

      case 'test': {
        const testClass = className.replace(/Test$/i, '') + 'Test';
        relativePath = `tests/Unit/${testClass}.js`;
        stubContent = `import { test } from 'node:test';
import assert from 'node:assert/strict';

test('{{ testClass }} test suite', () => {
  assert.equal(true, true);
});
`;
        vars.testClass = testClass;
        break;
      }

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
