import { AuthorizationException } from "../../exceptions/AuthException.js";

export function createVerifiedMiddleware(authManager) {
  return async function verifiedMiddleware(context, next) {
    const user = await authManager.user();
    if (!user) {
      throw new AuthorizationException("Unauthenticated.");
    }
    const isVerified = typeof user.hasVerifiedEmail === "function" ? user.hasVerifiedEmail() : Boolean(user.email_verified_at);
    if (!isVerified) {
      throw new AuthorizationException("Your email address is not verified.");
    }
    return next();
  };
}

export function createSignedUrlMiddleware(signedUrlGuard) {
  return async function signedUrlMiddleware(context, next) {
    const requestUrl = context.request?.url || context.url;
    if (!requestUrl || !signedUrlGuard.hasValidSignature(requestUrl)) {
      throw new AuthorizationException("Invalid or expired URL signature.");
    }
    return next();
  };
}

export function createCanMiddleware(gate) {
  return async function canMiddleware(context, next, ability, ...args) {
    const user = context.user || (context.request ? context.request.user : null);
    await gate.authorize(user, ability, ...args);
    return next();
  };
}

export function createRoleMiddleware(permissionResolver) {
  return async function roleMiddleware(context, next, role) {
    const user = context.user || (context.request ? context.request.user : null);
    const hasRole = await permissionResolver.hasRole(user, role);
    if (!hasRole) {
      throw new AuthorizationException(`User does not have required role '${role}'.`);
    }
    return next();
  };
}

export function createPermissionMiddleware(permissionResolver) {
  return async function permissionMiddleware(context, next, permission) {
    const user = context.user || (context.request ? context.request.user : null);
    const hasPerm = await permissionResolver.hasPermission(user, permission);
    if (!hasPerm) {
      throw new AuthorizationException(`User does not have required permission '${permission}'.`);
    }
    return next();
  };
}
