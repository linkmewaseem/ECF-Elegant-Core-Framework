import { TestApplication } from '../TestApplication.js';

let instance = null;

function getInstance() {
  if (!instance) {
    instance = new TestApplication();
  }
  return instance;
}

export const TestFacade = new Proxy(
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

export const Test = TestFacade;
export default TestFacade;
