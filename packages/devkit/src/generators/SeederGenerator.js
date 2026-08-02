import { CodeGenerator } from './CodeGenerator.js';

export class SeederGenerator extends CodeGenerator {
  async generate(name, options = {}) {
    const names = this.formatNames(name);
    const stub = `import { Seeder } from '@ecf/database';

export class {{pascal}}Seeder extends Seeder {
  async run() {
    // Seed database records
  }
}

export default {{pascal}}Seeder;
`;

    const compiled = this.stubCompiler.compileStub('seeder', stub, { pascal: names.pascal });
    const targetPath = options.path || `./database/seeders/${names.pascal}Seeder.js`;
    return this.writeFile(targetPath, compiled, options);
  }
}

export default SeederGenerator;
