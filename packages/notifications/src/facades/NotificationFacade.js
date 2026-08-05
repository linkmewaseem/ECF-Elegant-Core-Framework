import { Facade } from "@ecfjs/core";

export class NotificationFacadeClass extends Facade {
  static accessor() {
    return "notifications";
  }
}

export const NotificationFacade = Facade.create(NotificationFacadeClass);
export default NotificationFacade;
