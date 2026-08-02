import { BaseAiDriver } from './BaseAiDriver.js';

export class GeminiDriver extends BaseAiDriver {
  async chat(prompt, options = {}) {
    const model = options.model || this.config.model || 'gemini-1.5-pro';
    return {
      text: `[Google ${model}] AI Response to: "${prompt}"`,
      model,
      usage: { promptTokens: 12, completionTokens: 20, totalTokens: 32 },
    };
  }
}

export default GeminiDriver;
