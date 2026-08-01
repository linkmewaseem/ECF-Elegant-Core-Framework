import BaseGuard from "./BaseGuard.js";

export class SessionGuard extends BaseGuard {
  constructor(name, provider, sessionManager, rememberMeManager = null, eventDispatcher = null) {
    super();
    this.name = name;
    this.provider = provider;
    this.sessionManager = sessionManager;
    this.rememberMeManager = rememberMeManager;
    this.eventDispatcher = eventDispatcher;
    this.currentSession = null;
    this.viaRememberState = false;
  }

  user() {
    return this._user;
  }

  async authenticateFromSession(sessionId) {
    if (!sessionId) return null;
    const session = await this.sessionManager.getSession(sessionId);
    if (!session || !session.userId) return null;

    const user = await this.provider.retrieveById(session.userId);
    if (user) {
      this.setUser(user);
      this.currentSession = session;
    }
    return user;
  }

  async attempt(credentials = {}, remember = false) {
    const user = await this.provider.retrieveByCredentials(credentials);
    if (!user) {
      this.dispatchEvents("FailedLoginEvent", { credentials });
      return false;
    }

    const isValid = await this.provider.validateCredentials(user, credentials);
    if (!isValid) {
      this.dispatchEvents("FailedLoginEvent", { user, credentials });
      return false;
    }

    await this.login(user, remember);
    return true;
  }

  async login(user, remember = false) {
    this.setUser(user);

    // Create session & rotate session ID to prevent session fixation
    const userId = typeof user.getAuthIdentifier === "function" ? user.getAuthIdentifier() : user.id;
    this.currentSession = await this.sessionManager.createSession(userId, {
      authGuard: this.name,
      authenticatedAt: Date.now()
    });

    let rememberToken = null;
    if (remember && this.rememberMeManager) {
      rememberToken = await this.rememberMeManager.createToken(userId);
    }

    this.dispatchEvents("LoginEvent", { user, guard: this.name, remember });

    return {
      session: this.currentSession,
      rememberToken
    };
  }

  async logout() {
    if (this.currentSession) {
      await this.sessionManager.destroy(this.currentSession.id);
    }
    const user = this._user;
    this._user = null;
    this.currentSession = null;
    this.viaRememberState = false;

    if (user) {
      this.dispatchEvents("LogoutEvent", { user, guard: this.name });
    }
  }

  viaRemember() {
    return this.viaRememberState;
  }

  dispatchEvents(eventName, payload) {
    if (this.eventDispatcher && typeof this.eventDispatcher.dispatch === "function") {
      this.eventDispatcher.dispatch(eventName, payload);
    }
  }
}

export default SessionGuard;
