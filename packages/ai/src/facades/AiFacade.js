import { Facade } from '@ecfjs/core';
import { AiManager } from '../AiManager.js';

let fallbackInstance = null;

function getInstance() {
  try {
    const container = typeof Facade?.getContainer === 'function' ? Facade.getContainer() : null;
    if (container && typeof container.has === 'function' && container.has('ai')) {
      return container.make('ai');
    }
  } catch {
    // Fall back to standalone instance if Facade is uninitialized
  }

  if (!fallbackInstance) {
    fallbackInstance = new AiManager();
  }
  return fallbackInstance;
}

export const AiFacade = new Proxy(
  {},
  {
    get(_target, prop) {
      const inst = getInstance();
      if (typeof inst[prop] === 'function') {
        return inst[prop].bind(inst);
      }
      return inst[prop];
    },
  }
);

export const AI = AiFacade;
globalThis.__ECF_AI__ = AiFacade;
export default AiFacade;
