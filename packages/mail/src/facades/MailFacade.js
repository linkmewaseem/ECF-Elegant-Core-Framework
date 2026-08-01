import { Facade } from "@ecf/core";

export class MailFacadeClass extends Facade {
  static accessor() {
    return "mail";
  }
}

export const Mail = Facade.create(MailFacadeClass);
export default Mail;
