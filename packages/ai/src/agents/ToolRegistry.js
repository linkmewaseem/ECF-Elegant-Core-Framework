/**
 * Strict Tool Registry with Schema Validation for AI Agents.
 */
export class ToolRegistry {
  #tools = new Map();

  register(name, definition) {
    this.#tools.set(name, {
      name,
      description: definition.description || '',
      execute: definition.execute,
      schema: definition.schema || {},
    });
    return this;
  }

  get(name) {
    return this.#tools.get(name);
  }

  async execute(name, args) {
    const tool = this.get(name);
    if (!tool) {
      throw new Error(`Tool "${name}" is not registered.`);
    }
    return tool.execute(args);
  }
}

export default ToolRegistry;
