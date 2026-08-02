/**
 * Model Factory Engine.
 * Supports Factory.define(), create(), make(), count(), state(), sequence(), and recycle().
 */
export class ModelFactory {
  static #definitions = new Map();

  /**
   * Define a model factory rule.
   * @param {Function|string} model
   * @param {Function} definitionFn
   */
  static define(model, definitionFn) {
    const key = typeof model === 'string' ? model : model.name;
    ModelFactory.#definitions.set(key, definitionFn);
  }

  constructor(model, testDatabase = null) {
    this.model = model;
    this.modelName = typeof model === 'string' ? model : model.name;
    this.testDatabase = testDatabase;
    this.amount = 1;
    this.states = [];
    this.sequenceIndex = 0;
  }

  count(n) {
    this.amount = n;
    return this;
  }

  state(stateFn) {
    this.states.push(stateFn);
    return this;
  }

  sequence(...sequences) {
    this.sequenceIndex = 0;
    this.sequenceList = sequences;
    return this;
  }

  /**
   * Generate raw attribute object without persisting.
   * @param {Object} [overrides]
   * @returns {Object|Object[]}
   */
  make(overrides = {}) {
    const definitionFn = ModelFactory.#definitions.get(this.modelName) || (() => ({}));
    const makeSingle = (idx) => {
      let attrs = { id: idx + 1, ...definitionFn(ModelFactory.faker) };
      for (const stateFn of this.states) {
        attrs = { ...attrs, ...stateFn(attrs) };
      }
      if (this.sequenceList && this.sequenceList.length > 0) {
        const seqVal = this.sequenceList[idx % this.sequenceList.length];
        attrs = { ...attrs, ...(typeof seqVal === 'function' ? seqVal(idx) : seqVal) };
      }
      return { ...attrs, ...overrides };
    };

    if (this.amount === 1) {
      return makeSingle(0);
    }

    const results = [];
    for (let i = 0; i < this.amount; i++) {
      results.push(makeSingle(i));
    }
    return results;
  }

  /**
   * Make and persist models.
   * @param {Object} [overrides]
   * @returns {Promise<Object|Object[]>}
   */
  async create(overrides = {}) {
    const records = this.make(overrides);
    const list = Array.isArray(records) ? records : [records];

    if (this.testDatabase) {
      this.testDatabase.seedTable(this.modelName.toLowerCase() + 's', list);
    }

    if (typeof this.model === 'function' && typeof this.model.create === 'function') {
      const instances = [];
      for (const item of list) {
        instances.push(await this.model.create(item));
      }
      return this.amount === 1 ? instances[0] : instances;
    }

    return this.amount === 1 ? list[0] : list;
  }

  static get faker() {
    return {
      name: () => 'John Doe',
      email: () => `user_${Math.random().toString(36).substring(2, 8)}@example.com`,
      word: () => 'sample',
      number: (min = 1, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
      boolean: () => Math.random() > 0.5,
    };
  }
}

export const factory = (model, db = null) => new ModelFactory(model, db);
export default ModelFactory;
