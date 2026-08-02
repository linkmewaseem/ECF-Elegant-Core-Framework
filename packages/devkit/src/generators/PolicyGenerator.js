import { CodeGenerator } from './CodeGenerator.js';

export class PolicyGenerator extends CodeGenerator {
  async generate(name, options = {}) {
    const names = this.formatNames(name);
    const stub = `export class {{pascal}}Policy {
  viewAny(user) { return true; }
  view(user, model) { return true; }
  create(user) { return true; }
  update(user, model) { return true; }
  delete(user, model) { return true; }
}

export default {{pascal}}Policy;
`;

    const compiled = this.stubCompiler.compileStub('policy', stub, { pascal: names.pascal });
    const targetPath = options.path || `./app/policies/${names.pascal}Policy.js`;
    return this.writeFile(targetPath, compiled, options);
  }
}

export default PolicyGenerator;
