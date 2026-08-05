import { Facade } from "@ecfjs/core";

export class GateFacadeClass extends Facade {
  static accessor() {
    return "gate";
  }
}

export const GateFacade = Facade.create(GateFacadeClass);
export default GateFacade;
