/**
 * Route Model Binding Engine.
 * Resolves URI parameters (e.g. {user} or {post:slug}) to ORM model instances.
 */
export class ModelBinder {
  constructor(container = null) {
    this.container = container;
    this.customBindings = new Map();
  }

  /**
   * Explicitly bind a parameter key to a model resolver function or class.
   * @param {string} paramKey
   * @param {Function|class} resolver
   */
  bind(paramKey, resolver) {
    this.customBindings.set(paramKey, resolver);
    return this;
  }

  /**
   * Resolve parameter values into ORM models.
   * @param {object} params
   * @returns {Promise<object>}
   */
  async resolveParams(params = {}) {
    const resolved = {};

    for (const [key, value] of Object.entries(params)) {
      if (this.customBindings.has(key)) {
        const binding = this.customBindings.get(key);
        if (typeof binding === 'function') {
          if (typeof binding.find === 'function') {
            // Static find method
            resolved[key] = await binding.find(value);
          } else if (binding.prototype && typeof binding.prototype.find === 'function') {
            // Instance find method
            const inst = new binding();
            resolved[key] = await inst.find(value);
          } else {
            // Custom resolver function
            resolved[key] = await binding(value);
          }
        } else {
          resolved[key] = value;
        }
      } else if (key.includes(':')) {
        // Explicit field binding (e.g., {post:slug})
        const [modelKey, fieldName] = key.split(':');
        if (this.customBindings.has(modelKey)) {
          const modelClass = this.customBindings.get(modelKey);
          if (modelClass && typeof modelClass.where === 'function') {
            resolved[modelKey] = await modelClass.where(fieldName, value).first();
          } else {
            resolved[key] = value;
          }
        } else {
          resolved[key] = value;
        }
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }
}
