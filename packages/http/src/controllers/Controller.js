import { IController } from '../contracts/IController.js';

/**
 * Base Controller class providing helper response shortcuts and middleware registration.
 */
export class Controller extends IController {
  constructor() {
    super();
    this.middlewareStack = [];
  }

  /**
   * Register middleware for this controller actions.
   * @param {string|Function|Array} middleware
   * @param {object} [options] { only: [], except: [] }
   */
  middleware(middleware, options = {}) {
    const list = Array.isArray(middleware) ? middleware : [middleware];
    for (const mw of list) {
      this.middlewareStack.push({
        middleware: mw,
        only: options.only || null,
        except: options.except || null
      });
    }
    return this;
  }

  getMiddleware(actionName = null) {
    if (!actionName) return this.middlewareStack.map(m => m.middleware);

    return this.middlewareStack
      .filter(item => {
        if (item.only && !item.only.includes(actionName)) return false;
        if (item.except && item.except.includes(actionName)) return false;
        return true;
      })
      .map(item => item.middleware);
  }
}
