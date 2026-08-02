import { CodeGenerator } from './CodeGenerator.js';

export class EventGenerator extends CodeGenerator {
  async generate(name, options = {}) {
    const names = this.formatNames(name);
    const stub = `export class {{pascal}}Event {
  constructor(data) {
    this.data = data;
  }
}

export default {{pascal}}Event;
`;

    const compiled = this.stubCompiler.compileStub('event', stub, { pascal: names.pascal });
    const targetPath = options.path || `./app/events/${names.pascal}Event.js`;
    return this.writeFile(targetPath, compiled, options);
  }
}

export default EventGenerator;
