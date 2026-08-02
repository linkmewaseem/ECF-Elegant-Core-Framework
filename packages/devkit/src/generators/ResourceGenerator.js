import { CodeGenerator } from './CodeGenerator.js';

export class ResourceGenerator extends CodeGenerator {
  async generate(name, options = {}) {
    const names = this.formatNames(name);
    const stub = `import { ApiResource } from '@ecf/api';

export class {{pascal}}Resource extends ApiResource {
  toArray() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      createdAt: this.resource.created_at,
    };
  }
}

export default {{pascal}}Resource;
`;

    const compiled = this.stubCompiler.compileStub('resource', stub, { pascal: names.pascal });
    const targetPath = options.path || `./app/http/resources/${names.pascal}Resource.js`;
    return this.writeFile(targetPath, compiled, options);
  }
}

export default ResourceGenerator;
