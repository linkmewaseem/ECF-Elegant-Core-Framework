import { AuthenticationException } from "../../exceptions/AuthException.js";

export function createAuthMiddleware(authManager) {
  return async function authMiddleware(context, next, ...guards) {
    const targetGuards = guards.length > 0 ? guards : [null];
    let authenticatedUser = null;

    for (const guardName of targetGuards) {
      const guard = authManager.guard(guardName);
      if (await guard.check()) {
        authenticatedUser = await guard.user();
        break;
      }
    }

    if (!authenticatedUser) {
      throw new AuthenticationException("Unauthenticated.", 401, targetGuards);
    }

    return next();
  };
}

export default createAuthMiddleware;
