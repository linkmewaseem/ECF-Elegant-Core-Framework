import { Facade } from "@ecfjs/core";

class ConfigFacadeClass extends Facade {
  static accessor() {
    return "config";
  }
}

export const ConfigFacade = Facade.create(ConfigFacadeClass);
export const Config = ConfigFacade;
export default ConfigFacade;

