export class AuthException extends Error {
  constructor(message = "Authentication exception.", status = 401, code = "ERR_AUTH") {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
  }
}

export class AuthenticationException extends AuthException {
  constructor(message = "Unauthenticated.", status = 401, guards = []) {
    super(message, status, "ERR_UNAUTHENTICATED");
    this.guards = guards;
  }
}

export class AuthorizationException extends AuthException {
  constructor(message = "This action is unauthorized.", status = 403) {
    super(message, status, "ERR_UNAUTHORIZED");
  }
}

export class InvalidCredentialsException extends AuthException {
  constructor(message = "Invalid credentials provided.", status = 401) {
    super(message, status, "ERR_INVALID_CREDENTIALS");
  }
}

export class TokenExpiredException extends AuthException {
  constructor(message = "Token has expired.", status = 401) {
    super(message, status, "ERR_TOKEN_EXPIRED");
  }
}

export class TokenRevokedException extends AuthException {
  constructor(message = "Token has been revoked.", status = 401) {
    super(message, status, "ERR_TOKEN_REVOKED");
  }
}

export class InvalidTokenException extends AuthException {
  constructor(message = "Invalid or malformed token.", status = 401) {
    super(message, status, "ERR_INVALID_TOKEN");
  }
}

export class AccountLockedException extends AuthException {
  constructor(message = "Account is locked or suspended.", status = 403) {
    super(message, status, "ERR_ACCOUNT_LOCKED");
  }
}

export class UserNotFoundException extends AuthException {
  constructor(message = "User not found.", status = 404) {
    super(message, status, "ERR_USER_NOT_FOUND");
  }
}

export default AuthException;
