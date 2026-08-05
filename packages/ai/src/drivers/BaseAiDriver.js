import { IAiDriver } from '@ecfjs/contracts';

/**
 * Base AI Driver providing capability matrix and common formatting logic.
 */
export class BaseAiDriver extends IAiDriver {
  constructor(config = {}) {
    super();
    this.config = config;
  }

  getCapabilities() {
    return {
      supportsChat: true,
      supportsEmbedding: true,
      supportsVision: true,
      supportsImage: true,
      supportsAudio: false,
      supportsStreaming: true,
      supportsTools: true,
      supportsFunctionCalling: true,
      supportsJSON: true,
      supportsReasoning: false,
      supportsCache: true,
      supportsBatch: true,
      supportsModeration: true,
    };
  }

  async chat(prompt, options = {}) {
    throw new Error('Method chat() must be implemented by driver.');
  }

  async embed(text, options = {}) {
    // Default mock 1536-dimensional vector for base driver
    return Array.from({ length: 1536 }, (_, i) => Math.sin(i * 0.01));
  }
}

export default BaseAiDriver;
