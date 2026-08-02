import { BaseAiDriver } from './BaseAiDriver.js';

export class OpenRouterDriver extends BaseAiDriver {
  async chat(prompt, options = {}) {
    const model = options.model || this.config.model || 'auto';
    return {
      text: `[OpenRouter ${model}] AI Response to: "${prompt}"`,
      model,
      usage: { promptTokens: 14, completionTokens: 22, totalTokens: 36 },
    };
  }
}

export default OpenRouterDriver;
