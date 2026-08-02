import { BaseAiDriver } from './BaseAiDriver.js';

export class OllamaDriver extends BaseAiDriver {
  async chat(prompt, options = {}) {
    const model = options.model || this.config.model || 'llama3';
    return {
      text: `[Ollama ${model}] Local AI Response to: "${prompt}"`,
      model,
      usage: { promptTokens: 10, completionTokens: 15, totalTokens: 25 },
    };
  }
}

export default OllamaDriver;
