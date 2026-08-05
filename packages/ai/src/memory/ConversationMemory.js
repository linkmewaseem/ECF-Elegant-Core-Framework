import { IConversationMemory } from '@ecfjs/contracts';

/**
 * State-managed Conversation Memory (AI.memory(conversationId)).
 */
export class ConversationMemory extends IConversationMemory {
  #messages = [];

  constructor(conversationId) {
    super();
    this.conversationId = conversationId;
  }

  addMessage(role, content) {
    this.#messages.push({ role, content, timestamp: Date.now() });
    return this;
  }

  getHistory() {
    return [...this.#messages];
  }

  clear() {
    this.#messages = [];
    return this;
  }
}

export default ConversationMemory;
