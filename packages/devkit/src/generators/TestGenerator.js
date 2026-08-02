import { CodeGenerator } from './CodeGenerator.js';

export class TestGenerator extends CodeGenerator {
  async generate(name, options = {}) {
    const names = this.formatNames(name);
    const stub = `import { test } from '@ecf/testing';

test('{{pascal}} Test Feature', async ({ app, http, database }) => {
  const res = await http.get('/');
  res.assertOk();
});
`;

    const compiled = this.stubCompiler.compileStub('test', stub, { pascal: names.pascal });
    const targetPath = options.path || `./tests/unit/${names.pascal}.test.js`;
    return this.writeFile(targetPath, compiled, options);
  }
}

export default TestGenerator;
