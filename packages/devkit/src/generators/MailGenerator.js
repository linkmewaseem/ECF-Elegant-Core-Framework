import { CodeGenerator } from './CodeGenerator.js';

export class MailGenerator extends CodeGenerator {
  async generate(name, options = {}) {
    const names = this.formatNames(name);
    const stub = `export class {{pascal}}Mail {
  constructor(data) {
    this.data = data;
  }

  build() {
    return {
      subject: '{{pascal}} Notification',
      html: '<h1>Hello</h1>',
    };
  }
}

export default {{pascal}}Mail;
`;

    const compiled = this.stubCompiler.compileStub('mail', stub, { pascal: names.pascal });
    const targetPath = options.path || `./app/mail/${names.pascal}Mail.js`;
    return this.writeFile(targetPath, compiled, options);
  }
}

export default MailGenerator;
