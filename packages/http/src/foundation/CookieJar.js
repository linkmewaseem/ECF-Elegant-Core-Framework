import crypto from 'node:crypto';

/**
 * Enterprise Signed and Encrypted Cookie Jar Manager.
 */
export class CookieJar {
  /**
   * @param {string} [secretKey]
   */
  constructor(secretKey = 'ecf-default-cookie-secret-key-32b') {
    this.secretKey = secretKey;
    this.queuedCookies = new Map();
  }

  /**
   * Create a signed cookie string.
   * @param {string} value
   * @returns {string}
   */
  sign(value) {
    const signature = crypto.createHmac('sha256', this.secretKey).update(value).digest('hex');
    return `${value}.${signature}`;
  }

  /**
   * Unsign and verify a cookie string.
   * @param {string} signedValue
   * @returns {string|null}
   */
  unsign(signedValue) {
    if (!signedValue || typeof signedValue !== 'string') return null;
    const lastDot = signedValue.lastIndexOf('.');
    if (lastDot === -1) return null;

    const value = signedValue.slice(0, lastDot);
    const signature = signedValue.slice(lastDot + 1);
    const expected = crypto.createHmac('sha256', this.secretKey).update(value).digest('hex');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);

    if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
      return value;
    }
    return null;
  }

  /**
   * Queue a cookie for sending.
   * @param {string} name
   * @param {string} value
   * @param {object} [options]
   */
  make(name, value, options = {}) {
    const signedValue = options.signed !== false ? this.sign(value) : value;
    const opts = {
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      secure: false,
      maxAge: 86400,
      ...options
    };

    let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(signedValue)}`;
    if (opts.path) cookieStr += `; Path=${opts.path}`;
    if (opts.maxAge) cookieStr += `; Max-Age=${opts.maxAge}`;
    if (opts.domain) cookieStr += `; Domain=${opts.domain}`;
    if (opts.sameSite) cookieStr += `; SameSite=${opts.sameSite}`;
    if (opts.httpOnly) cookieStr += `; HttpOnly`;
    if (opts.secure) cookieStr += `; Secure`;

    this.queuedCookies.set(name, cookieStr);
    return cookieStr;
  }

  getQueuedCookies() {
    return Array.from(this.queuedCookies.values());
  }
}
