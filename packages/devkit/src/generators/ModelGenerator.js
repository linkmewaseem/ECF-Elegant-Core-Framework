import { CodeGenerator } from './CodeGenerator.js';

export class ModelGenerator extends CodeGenerator {
  async generate(name, options = {}) {
    await this.beforeGenerate(options);

    const names = this.formatNames(name);
    const stub = `import { Model } from '@ecf/database';

export class {{pascal}} extends Model {
  static table = '{{snake_plural}}';
  static fillable = ['name'];
}

export default {{pascal}};
`;

    const compiled = this.stubCompiler.compileStub('model', stub, {
      pascal: names.pascal,
      snake_plural: names.snake + 's',
    });

    const targetPath = options.path || `./app/models/${names.pascal}.js`;
    const res = await this.writeFile(targetPath, compiled, options);

    await this.afterGenerate(options, res);
    return res;
  }
}

export default ModelGenerator;
