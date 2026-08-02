/**
 * Versioned Prompt Template Registry (AI.prompt("support@v2")).
 */
export class PromptRegistry {
  #prompts = new Map();

  register(name, template, version = 'v1') {
    const key = `${name}@${version}`;
    this.#prompts.set(key, template);
    this.#prompts.set(name, template); // Default version alias
    return this;
  }

  render(nameWithVersion, variables = {}) {
    const template = this.#prompts.get(nameWithVersion);
    if (!template) {
      throw new Error(`Prompt template "${nameWithVersion}" is not registered.`);
    }

    let rendered = template;
    for (const [k, v] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), v);
    }
    return rendered;
  }
}

export default PromptRegistry;
