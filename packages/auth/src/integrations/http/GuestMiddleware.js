import { AuthException } from "../../exceptions/AuthException.js";

export function createGuestMiddleware(authManager) {
  return async function guestMiddleware(context, next, guardName = null) {
    const guard = authManager.guard(guardName);
    if (await guard.check()) {
      throw new AuthException("Already authenticated.", 400, "ERR_GUEST_ONLY");
    }
    return next();
  };
}

export default createGuestMiddleware;
