import { Facade } from '@ecf/core';

class DevToolsFacadeClass extends Facade {
  static accessor() {
    return 'devtools';
  }
}

export const DevToolsFacade = Facade.create(DevToolsFacadeClass);
export const DevTools = DevToolsFacade;
export default DevToolsFacade;
