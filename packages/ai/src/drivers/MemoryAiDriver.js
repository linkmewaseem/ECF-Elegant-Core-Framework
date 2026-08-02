import { BaseAiDriver } from './BaseAiDriver.js';

export class MemoryAiDriver extends BaseAiDriver {
  constructor(config = {}) {
    super(config);
    this.logs = [];
  }

  async chat(prompt, options = {}) {
    const res = {
      text: `[Memory AI] Mock response to: "${prompt}"`,
      model: 'memory-mock',
      usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15 },
    };
    this.logs.push({ prompt, options, res });
    return res;
  }
}

export default MemoryAiDriver;
