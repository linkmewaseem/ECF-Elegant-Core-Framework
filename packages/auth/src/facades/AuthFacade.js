import { Facade } from "@ecf/core";

export class AuthFacadeClass extends Facade {
  static accessor() {
    return "auth";
  }
}

export const Auth = Facade.create(AuthFacadeClass);
export default Auth;
