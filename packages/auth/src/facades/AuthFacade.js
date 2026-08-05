import { Facade } from "@ecfjs/core";

export class AuthFacadeClass extends Facade {
  static accessor() {
    return "auth";
  }
}

export const Auth = Facade.create(AuthFacadeClass);
export default Auth;
