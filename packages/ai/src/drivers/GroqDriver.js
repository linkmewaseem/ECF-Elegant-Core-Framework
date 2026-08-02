import { BaseAiDriver } from './BaseAiDriver.js';

export class GroqDriver extends BaseAiDriver {
  async chat(prompt, options = {}) {
    const model = options.model || this.config.model || 'llama-3.1-70b-versatile';
    return {
      text: `[Groq ${model}] Fast AI Response to: "${prompt}"`,
      model,
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    };
  }
}

export default GroqDriver;
