/**
 * Interface for AI Manager.
 * @interface IAiManager
 */
export class IAiManager {
  chat(prompt, options) { throw new Error('Method chat() must be implemented.'); }
  stream(prompt, options) { throw new Error('Method stream() must be implemented.'); }
  embed(text, options) { throw new Error('Method embed() must be implemented.'); }
  memory(conversationId) { throw new Error('Method memory() must be implemented.'); }
  prompt(name, variables) { throw new Error('Method prompt() must be implemented.'); }
  agent(options) { throw new Error('Method agent() must be implemented.'); }
  rag(options) { throw new Error('Method rag() must be implemented.'); }
  mcp(serverName) { throw new Error('Method mcp() must be implemented.'); }
}

/**
 * Interface for AI Drivers.
 * @interface IAiDriver
 */
export class IAiDriver {
  chat(prompt, options) { throw new Error('Method chat() must be implemented.'); }
  embed(text, options) { throw new Error('Method embed() must be implemented.'); }
  getCapabilities() { throw new Error('Method getCapabilities() must be implemented.'); }
}

/**
 * Interface for Conversation Memory.
 * @interface IConversationMemory
 */
export class IConversationMemory {
  addMessage(role, content) { throw new Error('Method addMessage() must be implemented.'); }
  getHistory() { throw new Error('Method getHistory() must be implemented.'); }
  clear() { throw new Error('Method clear() must be implemented.'); }
}

export default IAiManager;
