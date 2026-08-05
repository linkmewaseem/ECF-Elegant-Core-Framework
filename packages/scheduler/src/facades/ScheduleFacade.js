import { Facade } from '@ecfjs/core';

class ScheduleFacadeClass extends Facade {
  static accessor() {
    return 'schedule';
  }
}

export const ScheduleFacade = Facade.create(ScheduleFacadeClass);
export const Schedule = ScheduleFacade;
export default ScheduleFacade;
