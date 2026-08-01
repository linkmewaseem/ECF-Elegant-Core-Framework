import { Facade } from "@ecf/core";

export class StorageFacadeClass extends Facade {
  static accessor() {
    return "storage";
  }
}

export const Storage = Facade.create(StorageFacadeClass);
export default Storage;
