import { IRequest } from '../contracts/IRequest.js';
import AttributeBag from '../AttributeBag.js';
import { Validator } from '@ecfjs/validation';
import ValidationException from '../exceptions/ValidationException.js';

/**
 * Base Abstract Request providing common request inspection logic.
 * Adapters (Native, Express, Fastify, Bun) extend this class to normalize runtime specifics.
 */
export class AbstractRequest extends IRequest {
  constructor() {
    super();
    this.attributes = new AttributeBag();
    this.params = {};
    this.queryData = null;
    this.bodyData = null;
    this.filesData = {};
    this.currentUser = null;
    this.validatedInput = null;
  }

  user() {
    return this.currentUser;
  }

  setUser(user) {
    this.currentUser = user;
    return this;
  }

  setAttribute(key, value) {
    this.attributes.set(key, value);
    return this;
  }

  getAttribute(key, defaultValue = null) {
    return this.attributes.get(key, defaultValue);
  }

  hasAttribute(key) {
    return this.attributes.has(key);
  }

  setParams(params) {
    this.params = params || {};
    return this;
  }

  param(key, defaultValue = null) {
    return Object.prototype.hasOwnProperty.call(this.params, key) ? this.params[key] : defaultValue;
  }

  wantsJson() {
    const accept = this.header('accept', '');
    return accept.includes('application/json');
  }

  expectsJson() {
    return this.wantsJson();
  }

  all() {
    return {
      ...(this.query() || {}),
      ...(this.input() || {})
    };
  }

  /**
   * Validate request payload using rules.
   * @param {object} rules
   * @param {object} [customMessages]
   * @returns {Promise<object>}
   */
  async validate(rules, customMessages = {}) {
    const validator = new Validator();
    const result = await validator.validate(this.all(), rules, customMessages);

    if (result.fails()) {
      throw new ValidationException('The given data was invalid.', result.errors());
    }

    this.validatedInput = result.validated();
    return this.validatedInput;
  }

  validated() {
    return this.validatedInput || {};
  }

  safe(keys = null) {
    const data = this.validated();
    if (!keys) return data;
    const keyList = Array.isArray(keys) ? keys : [keys];
    const result = {};
    for (const k of keyList) {
      if (Object.prototype.hasOwnProperty.call(data, k)) {
        result[k] = data[k];
      }
    }
    return result;
  }
}
