import assert from 'node:assert';

/**
 * Testing Fake Assertions for AI operations.
 */
export class AiFake {
  #chats = [];
  #embeddings = [];
  #prompts = [];

  recordChat(prompt, options, response) {
    this.#chats.push({ prompt, options, response });
  }

  recordEmbedding(text) {
    this.#embeddings.push(text);
  }

  recordPrompt(name, variables) {
    this.#prompts.push({ name, variables });
  }

  assertChatted(promptSubstring) {
    const matched = this.#chats.some((c) => c.prompt.includes(promptSubstring));
    assert.ok(matched, `Expected AI chat containing "${promptSubstring}", but none was recorded.`);
  }

  assertEmbedded(textSubstring) {
    const matched = this.#embeddings.some((t) => t.includes(textSubstring));
    assert.ok(matched, `Expected AI embedding containing "${textSubstring}", but none was recorded.`);
  }
}

export default AiFake;
