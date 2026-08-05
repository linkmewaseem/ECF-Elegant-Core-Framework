import { Facade } from "@ecfjs/core";

export class MailFacadeClass extends Facade {
  static accessor() {
    return "mail";
  }
}

export const Mail = Facade.create(MailFacadeClass);
export default Mail;
