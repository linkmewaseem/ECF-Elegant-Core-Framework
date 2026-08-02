import { CodeGenerator } from './CodeGenerator.js';

export class CommandGenerator extends CodeGenerator {
  async generate(name, options = {}) {
    const names = this.formatNames(name);
    const stub = `import { Command } from '@ecf/console';

export class {{pascal}}Command extends Command {
  static signature = '{{kebab}}';
  static description = 'Description for {{kebab}} command';

  async handle() {
    this.info('Running {{kebab}} command');
  }
}

export default {{pascal}}Command;
`;

    const compiled = this.stubCompiler.compileStub('command', stub, { pascal: names.pascal, kebab: names.kebab });
    const targetPath = options.path || `./app/console/commands/${names.pascal}Command.js`;
    return this.writeFile(targetPath, compiled, options);
  }
}

export default CommandGenerator;
