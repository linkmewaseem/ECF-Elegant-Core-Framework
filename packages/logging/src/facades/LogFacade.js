import { LogManager } from '../LogManager.js';

let defaultInstance = null;

function getInstance() {
  if (!defaultInstance) {
    defaultInstance = new LogManager();
  }
  return defaultInstance;
}

export const LogFacade = new Proxy(
  {},
  {
    get(_target, prop) {
      const instance = getInstance();
      if (typeof instance[prop] === 'function') {
        return instance[prop].bind(instance);
      }
      return instance[prop];
    },
  }
);

export const Log = LogFacade;
export default LogFacade;
