import { CodeGenerator } from './CodeGenerator.js';

export class ListenerGenerator extends CodeGenerator {
  async generate(name, options = {}) {
    const names = this.formatNames(name);
    const stub = `export class {{pascal}}Listener {
  async handle(event) {
    // Event listener logic
  }
}

export default {{pascal}}Listener;
`;

    const compiled = this.stubCompiler.compileStub('listener', stub, { pascal: names.pascal });
    const targetPath = options.path || `./app/listeners/${names.pascal}Listener.js`;
    return this.writeFile(targetPath, compiled, options);
  }
}

export default ListenerGenerator;
