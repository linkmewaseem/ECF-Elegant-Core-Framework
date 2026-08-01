import { AsyncLocalStorage } from "node:async_hooks";

export class AuthContext {
  static #storage = new AsyncLocalStorage();

  /**
   * Run a callback within an isolated AuthContext.
   */
  static run(contextData, callback) {
    const context = {
      requestId: contextData.requestId || null,
      guard: contextData.guard || null,
      user: contextData.user || null,
      sessionId: contextData.sessionId || null,
      authenticationMethod: contextData.authenticationMethod || null,
      scopes: contextData.scopes || [],
      ...contextData
    };
    return this.#storage.run(context, callback);
  }

  /**
   * Get the current request's auth context.
   */
  static current() {
    return this.#storage.getStore() || null;
  }

  /**
   * Get current authenticated user from context.
   */
  static user() {
    return this.current()?.user || null;
  }

  /**
   * Get active guard name from context.
   */
  static guard() {
    return this.current()?.guard || null;
  }
}

export default AuthContext;
