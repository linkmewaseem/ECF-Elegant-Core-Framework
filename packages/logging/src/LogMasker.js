/**
 * Sensitive Data Masker.
 * Automatically redacts sensitive fields in log contexts.
 */
export class LogMasker {
  static DEFAULT_SENSITIVE_KEYS = [
    'password',
    'password_confirmation',
    'pass',
    'secret',
    'token',
    'jwt',
    'access_token',
    'refresh_token',
    'auth',
    'authorization',
    'cookie',
    'credit_card',
    'card_number',
    'cvv',
    'ssn',
    'cnic',
    'api_key',
    'apikey',
    'private_key',
  ];

  constructor({ sensitiveKeys = [], replacement = '********' } = {}) {
    this.sensitiveKeys = new Set(
      [...LogMasker.DEFAULT_SENSITIVE_KEYS, ...sensitiveKeys].map((k) => k.toLowerCase())
    );
    this.replacement = replacement;
  }

  /**
   * Recursively mask sensitive fields in target data.
   * @param {any} data
   * @returns {any}
   */
  mask(data) {
    if (data === null || data === undefined) return data;
    if (typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.mask(item));
    }

    if (data instanceof Error) {
      return data;
    }

    const masked = {};
    for (const [key, value] of Object.entries(data)) {
      if (this.sensitiveKeys.has(key.toLowerCase())) {
        masked[key] = this.replacement;
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = this.mask(value);
      } else {
        masked[key] = value;
      }
    }

    return masked;
  }
}

export default LogMasker;
