import { Facade } from "@ecf/core";

class CacheFacadeClass extends Facade {
  static accessor() {
    return "cache";
  }
}

export const CacheFacade = Facade.create(CacheFacadeClass);
export const Cache = CacheFacade;
export default CacheFacade;
