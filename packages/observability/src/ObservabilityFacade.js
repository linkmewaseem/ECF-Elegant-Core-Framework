import { Facade } from '@ecf/core';

class ObservabilityFacadeClass extends Facade {
  static accessor() {
    return 'observability';
  }
}

export const ObservabilityFacade = Facade.create(ObservabilityFacadeClass);
export const Observability = ObservabilityFacade;
export default ObservabilityFacade;
