import { CodeGenerator } from './CodeGenerator.js';

export class MiddlewareGenerator extends CodeGenerator {
  async generate(name, options = {}) {
    const names = this.formatNames(name);
    const stub = `export class {{pascal}}Middleware {
  async handle(req, res, next) {
    // Middleware logic before next()
    await next();
  }
}

export default {{pascal}}Middleware;
`;

    const compiled = this.stubCompiler.compileStub('middleware', stub, { pascal: names.pascal });
    const targetPath = options.path || `./app/http/middleware/${names.pascal}Middleware.js`;
    return this.writeFile(targetPath, compiled, options);
  }
}

export default MiddlewareGenerator;
