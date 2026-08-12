import { ServiceProvider } from "@ecfjs/core";
import GuardManager from "../authentication/GuardManager.js";
import AuthManager from "../authentication/AuthManager.js";
import PasswordHasher from "../authentication/passwords/PasswordHasher.js";
import Gate from "../authorization/Gate.js";
import PolicyManager from "../authorization/PolicyManager.js";
import PermissionResolver from "../authorization/PermissionResolver.js";
import MfaManager from "../mfa/MfaManager.js";
import TotpProvider from "../mfa/TotpProvider.js";
import RecoveryCodeProvider from "../mfa/RecoveryCodeProvider.js";

export class AuthServiceProvider extends ServiceProvider {
  
  register(app) {
    app.singleton("auth.hasher", () => new PasswordHasher());
    app.singleton("auth.policy_manager", () => new PolicyManager());
    app.singleton("auth.permission_resolver", () => new PermissionResolver());

    app.singleton("auth.guard_manager", (app) => new GuardManager(app));

    app.singleton("auth", (app) => {
      const guardManager = app.make("auth.guard_manager");
      return new AuthManager(app, guardManager);
    });

    app.singleton("gate", (app) => {
      const policyManager = app.make("auth.policy_manager");
      return new Gate(async () => app.make("auth").user(), policyManager);
    });

    app.singleton("auth.mfa", () => {
      const mfa = new MfaManager();
      mfa.registerProvider("totp", new TotpProvider());
      mfa.registerProvider("recovery", new RecoveryCodeProvider());
      return mfa;
    });
  }

  boot(app) {
    // Perform any boot bindings
  }
}

export default AuthServiceProvider;
