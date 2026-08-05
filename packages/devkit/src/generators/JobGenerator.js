import { CodeGenerator } from './CodeGenerator.js';

export class JobGenerator extends CodeGenerator {
  async generate(name, options = {}) {
    const names = this.formatNames(name);
    const stub = `import { Job } from '@ecfjs/queue';

export class {{pascal}}Job extends Job {
  constructor(payload) {
    super(payload);
  }

  async handle() {
    // Background job processing
  }
}

export default {{pascal}}Job;
`;

    const compiled = this.stubCompiler.compileStub('job', stub, { pascal: names.pascal });
    const targetPath = options.path || `./app/jobs/${names.pascal}Job.js`;
    return this.writeFile(targetPath, compiled, options);
  }
}

export default JobGenerator;
