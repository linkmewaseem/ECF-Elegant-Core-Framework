import { CodeGenerator } from './CodeGenerator.js';

export class MigrationGenerator extends CodeGenerator {
  async generate(name, options = {}) {
    const names = this.formatNames(name);
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const stub = `import { Schema } from '@ecfjs/database';

export class Create{{pascal}}Table {
  async up() {
    await Schema.create('{{snake_plural}}', (table) => {
      table.id();
      table.string('name');
      table.timestamps();
    });
  }

  async down() {
    await Schema.dropIfExists('{{snake_plural}}');
  }
}

export default Create{{pascal}}Table;
`;

    const compiled = this.stubCompiler.compileStub('migration', stub, {
      pascal: names.pascal,
      snake_plural: names.snake + 's',
    });
    const targetPath = options.path || `./database/migrations/${timestamp}_create_${names.snake}_table.js`;
    return this.writeFile(targetPath, compiled, options);
  }
}

export default MigrationGenerator;
