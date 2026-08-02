import { BaseAiDriver } from './BaseAiDriver.js';

export class AnthropicDriver extends BaseAiDriver {
  async chat(prompt, options = {}) {
    const model = options.model || this.config.model || 'claude-3-5-sonnet';
    return {
      text: `[Anthropic ${model}] AI Response to: "${prompt}"`,
      model,
      usage: { promptTokens: 18, completionTokens: 30, totalTokens: 48 },
    };
  }
}

export default AnthropicDriver;
