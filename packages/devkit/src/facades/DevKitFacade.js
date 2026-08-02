import { DevKitManager } from '../DevKitManager.js';

let instance = null;

function getInstance() {
  if (!instance) {
    instance = new DevKitManager();
  }
  return instance;
}

export const DevKitFacade = new Proxy(
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

export const DevKit = DevKitFacade;
export default DevKitFacade;
