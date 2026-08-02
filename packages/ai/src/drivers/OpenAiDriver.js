import { BaseAiDriver } from './BaseAiDriver.js';

export class OpenAiDriver extends BaseAiDriver {
  async chat(prompt, options = {}) {
    const model = options.model || this.config.model || 'gpt-4o';
    return {
      text: `[OpenAI ${model}] AI Response to: "${prompt}"`,
      model,
      usage: { promptTokens: 15, completionTokens: 25, totalTokens: 40 },
    };
  }

  async embed(text, options = {}) {
    return Array.from({ length: 1536 }, (_, i) => Math.cos(i * 0.01));
  }
}

export default OpenAiDriver;
