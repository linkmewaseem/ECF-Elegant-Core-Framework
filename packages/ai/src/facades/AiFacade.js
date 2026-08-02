import { AiManager } from '../AiManager.js';

let instance = null;

function getInstance() {
  if (!instance) {
    instance = new AiManager();
  }
  return instance;
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
export default AiFacade;
