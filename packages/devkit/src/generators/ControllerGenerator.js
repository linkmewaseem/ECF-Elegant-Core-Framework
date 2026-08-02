import { CodeGenerator } from './CodeGenerator.js';

export class ControllerGenerator extends CodeGenerator {
  async generate(name, options = {}) {
    const names = this.formatNames(name);
    const stub = `export class {{pascal}}Controller {
  async index(req, res) {
    return res.json({ success: true, data: [] });
  }

  async show(req, res) {
    return res.json({ success: true, id: req.params.id });
  }
}

export default {{pascal}}Controller;
`;

    const compiled = this.stubCompiler.compileStub('controller', stub, { pascal: names.pascal });
    const targetPath = options.path || `./app/http/controllers/${names.pascal}Controller.js`;
    return this.writeFile(targetPath, compiled, options);
  }
}

export default ControllerGenerator;
