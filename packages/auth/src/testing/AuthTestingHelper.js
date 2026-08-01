import MemoryUserProvider from "../authentication/providers/MemoryUserProvider.js";
import SessionGuard from "../authentication/guards/SessionGuard.js";
import SessionManager from "../authentication/sessions/SessionManager.js";
import AuthManager from "../authentication/AuthManager.js";
import GuardManager from "../authentication/GuardManager.js";

export class AuthTestingHelper {
  static createMockAuth(users = []) {
    const provider = new MemoryUserProvider(users);
    const sessionManager = new SessionManager();
    const guardManager = new GuardManager();
    const guard = new SessionGuard("session", provider, sessionManager);

    guardManager.registerGuard("session", guard);
    const authManager = new AuthManager(null, guardManager);

    return {
      authManager,
      guard,
      provider,
      sessionManager,
      actingAs(user) {
        guard.setUser(user);
        return authManager;
      }
    };
  }
}

export default AuthTestingHelper;
