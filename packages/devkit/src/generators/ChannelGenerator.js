import { CodeGenerator } from './CodeGenerator.js';

export class ChannelGenerator extends CodeGenerator {
  async generate(name, options = {}) {
    const names = this.formatNames(name);
    const stub = `export class {{pascal}}Channel {
  join(user, channelId) {
    return true;
  }
}

export default {{pascal}}Channel;
`;

    const compiled = this.stubCompiler.compileStub('channel', stub, { pascal: names.pascal });
    const targetPath = options.path || `./app/broadcasting/${names.pascal}Channel.js`;
    return this.writeFile(targetPath, compiled, options);
  }
}

export default ChannelGenerator;
