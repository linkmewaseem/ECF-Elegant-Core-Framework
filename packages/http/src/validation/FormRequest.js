import { Validator } from '@ecfjs/validation';
import ValidationException from '../exceptions/ValidationException.js';
import ForbiddenException from '../exceptions/ForbiddenException.js';

/**
 * Base Form Request encapsulating request validation & authorization logic.
 */
export class FormRequest {
  constructor(request) {
    this.request = request;
    this.validatedData = null;
  }

  /**
   * Determine if user is authorized to make this request.
   * @returns {boolean|Promise<boolean>}
   */
  async authorize() {
    return true;
  }

  /**
   * Validation rules schema.
   * @returns {object}
   */
  rules() {
    return {};
  }

  /**
   * Custom validation error messages.
   * @returns {object}
   */
  messages() {
    return {};
  }

  /**
   * Execute authorization check and input validation.
   * @throws {ForbiddenException|ValidationException}
   */
  async validate() {
    const isAuthorized = await this.authorize();
    if (!isAuthorized) {
      throw new ForbiddenException('This action is unauthorized.');
    }

    const rules = this.rules();
    if (Object.keys(rules).length === 0) {
      this.validatedData = this.request.all();
      return this.validatedData;
    }

    const validator = new Validator();
    const result = await validator.validate(this.request.all(), rules, this.messages());

    if (result.fails()) {
      throw new ValidationException('The given data was invalid.', result.errors());
    }

    this.validatedData = result.validated();
    return this.validatedData;
  }

  validated() {
    return this.validatedData || {};
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
