import { IAiManager } from '@ecf/contracts';
import { OpenAiDriver } from './drivers/OpenAiDriver.js';
import { AnthropicDriver } from './drivers/AnthropicDriver.js';
import { GeminiDriver } from './drivers/GeminiDriver.js';
import { OllamaDriver } from './drivers/OllamaDriver.js';
import { OpenRouterDriver } from './drivers/OpenRouterDriver.js';
import { GroqDriver } from './drivers/GroqDriver.js';
import { MemoryAiDriver } from './drivers/MemoryAiDriver.js';
import { NullAiDriver } from './drivers/NullAiDriver.js';

import { ConversationMemory } from './memory/ConversationMemory.js';
import { PromptRegistry } from './prompts/PromptRegistry.js';
import { EmbeddingManager } from './embeddings/EmbeddingManager.js';
import { RagPipeline } from './rag/RagPipeline.js';
import { AgentPlanner } from './agents/AgentPlanner.js';
import { McpManager } from './mcp/McpManager.js';
import { AiFake } from './testing/AiFake.js';

/**
 * AiManager — Central Manager for ECF Enterprise AI Platform.
 */
export class AiManager extends IAiManager {
  #drivers = new Map();
  #memories = new Map();
  #fake = null;

  constructor(config = {}) {
    super();
    this.config = config;
    this.promptRegistry = new PromptRegistry();
    this.mcpManager = new McpManager();
    this.#registerDefaultDrivers();
  }

  #registerDefaultDrivers() {
    this.#drivers.set('openai', new OpenAiDriver(this.config.openai));
    this.#drivers.set('anthropic', new AnthropicDriver(this.config.anthropic));
    this.#drivers.set('gemini', new GeminiDriver(this.config.gemini));
    this.#drivers.set('ollama', new OllamaDriver(this.config.ollama));
    this.#drivers.set('openrouter', new OpenRouterDriver(this.config.openrouter));
    this.#drivers.set('groq', new GroqDriver(this.config.groq));
    this.#drivers.set('memory', new MemoryAiDriver(this.config.memory));
    this.#drivers.set('null', new NullAiDriver());
  }

  driver(name) {
    const driverName = name || this.config.driver || 'openai';
    const driver = this.#drivers.get(driverName.toLowerCase());
    if (!driver) {
      throw new Error(`AI Driver "${driverName}" is not registered.`);
    }
    return driver;
  }

  fake() {
    if (!this.#fake) {
      this.#fake = new AiFake();
    }
    return this.#fake;
  }

  async chat(prompt, options = {}) {
    const drv = this.driver(options.driver);
    const res = await drv.chat(prompt, options);

    if (this.#fake) {
      this.#fake.recordChat(prompt, options, res);
    }
    return res;
  }

  async *stream(prompt, options = {}) {
    const res = await this.chat(prompt, options);
    const words = res.text.split(' ');
    for (const word of words) {
      yield word + ' ';
    }
  }

  async embed(text, options = {}) {
    const drv = this.driver(options.driver);
    const embedding = await drv.embed(text, options);
    if (this.#fake) {
      this.#fake.recordEmbedding(text);
    }
    return embedding;
  }

  memory(conversationId) {
    if (!this.#memories.has(conversationId)) {
      this.#memories.set(conversationId, new ConversationMemory(conversationId));
    }
    return this.#memories.get(conversationId);
  }

  registerPrompt(name, template, version = 'v1') {
    this.promptRegistry.register(name, template, version);
    return this;
  }

  prompt(nameWithVersion, variables = {}) {
    const rendered = this.promptRegistry.render(nameWithVersion, variables);
    if (this.#fake) {
      this.#fake.recordPrompt(nameWithVersion, variables);
    }
    return rendered;
  }

  agent(options = {}) {
    return new AgentPlanner(this, options);
  }

  rag(options = {}) {
    return new RagPipeline(this);
  }

  mcp(serverName) {
    return this.mcpManager.connect(serverName);
  }
}

export default AiManager;
