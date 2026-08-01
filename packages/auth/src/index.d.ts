export class AuthContext {
  static run<T>(contextData: any, callback: () => T): T;
  static current(): any;
  static user(): any;
  static guard(): string | null;
}

export class IAuthManager {
  guard(name?: string | null): IGuard;
  setDefaultDriver(name: string): void;
  user(): any;
  id(): any;
  check(): boolean;
  guest(): boolean;
}

export class IGuard {
  check(): boolean;
  guest(): boolean;
  user(): any;
  id(): any;
  validate(credentials?: any): Promise<boolean>;
  setUser(user: any): this;
  hasUser(): boolean;
}

export class IUserProvider {
  retrieveById(identifier: any): Promise<any>;
  retrieveByToken(identifier: any, token: string): Promise<any>;
  updateRememberToken(user: any, token: string): Promise<void>;
  retrieveByCredentials(credentials: any): Promise<any>;
  validateCredentials(user: any, credentials: any): Promise<boolean>;
}

export class IAuthenticatable {
  getAuthIdentifierName(): string;
  getAuthIdentifier(): any;
  getAuthPasswordName(): string;
  getAuthPassword(): string;
  getRememberToken(): string | null;
  setRememberToken(value: string): void;
  getRememberTokenName(): string;
  isLocked?(): boolean;
  isSuspended?(): boolean;
  isDisabled?(): boolean;
}

export class IHasher {
  make(value: string, options?: any): Promise<string>;
  check(value: string, hashedValue: string, options?: any): Promise<boolean>;
  needsRehash(hashedValue: string, options?: any): boolean;
}

export class IGate {
  define(ability: string, callback: Function): this;
  policy(model: any, policy: any): this;
  allows(user: any, ability: string, ...args: any[]): Promise<boolean>;
  denies(user: any, ability: string, ...args: any[]): Promise<boolean>;
  check(user: any, ability: string, ...args: any[]): Promise<boolean>;
  authorize(user: any, ability: string, ...args: any[]): Promise<boolean>;
  before(callback: Function): this;
  after(callback: Function): this;
}

export class IPolicy {
  before(user: any, ability: string): any;
}

export class IPermissionResolver {
  getPermissions(user: any): Promise<string[]>;
  getRoles(user: any): Promise<string[]>;
  hasPermission(user: any, permission: string): Promise<boolean>;
  hasRole(user: any, role: string): Promise<boolean>;
}

export class AuthException extends Error {
  status: number;
  code: string;
}
export class AuthenticationException extends AuthException {}
export class AuthorizationException extends AuthException {}
export class InvalidCredentialsException extends AuthException {}
export class TokenExpiredException extends AuthException {}
export class TokenRevokedException extends AuthException {}
export class InvalidTokenException extends AuthException {}
export class AccountLockedException extends AuthException {}
export class UserNotFoundException extends AuthException {}

export class PasswordHasher extends IHasher {}
export class MemoryUserProvider extends IUserProvider {}
export class OrmUserProvider extends IUserProvider {}

export class BaseGuard extends IGuard {}
export class SessionGuard extends BaseGuard {
  login(user: any, remember?: boolean): Promise<any>;
  logout(): Promise<void>;
  attempt(credentials?: any, remember?: boolean): Promise<boolean>;
}
export class TokenGuard extends BaseGuard {}
export class JwtGuard extends BaseGuard {}
export class ApiKeyGuard extends BaseGuard {}
export class SignedUrlGuard extends BaseGuard {}
export class CustomGuard extends BaseGuard {}

export class JwtTokenService {
  encode(payload?: any, options?: any): string;
  decode(token: string, options?: any): Promise<any>;
}

export class ApiKeyService {
  generateKey(): { key: string; hash: string; prefix: string };
  hashKey(key: string): string;
  verifyKey(key: string, expectedHash: string): boolean;
}

export class PasswordBroker {
  sendResetLink(credentials: any, ipAddress?: string): Promise<any>;
  reset(credentials: any, callback?: Function): Promise<any>;
}

export class Gate extends IGate {}
export class PolicyManager {
  register(modelOrClass: any, policyOrClass: any): this;
  getPolicy(modelOrClass: any): any;
}
export class PermissionResolver extends IPermissionResolver {}

export class MfaManager {
  registerProvider(name: string, provider: any): this;
  verify(name: string, secretOrStore: any, code: string, extra?: any): Promise<any>;
}
export class TotpProvider {
  generateSecret(user: any, issuer?: string): { secret: string; encryptedSecret: string; uri: string };
  verifyCode(encryptedSecret: string, code: string, lastVerifiedStep?: number): any;
}
export class RecoveryCodeProvider {
  generateSecret(user: any, count?: number): { plainCodes: string[]; hashedCodes: string[] };
  verifyCode(hashedCodes: string[], plainCode: string): { valid: boolean; remainingCodes: string[] };
}

export class AuthServiceProvider {
  register(app: any): void;
  boot(app: any): void;
}

export const Auth: any;
export const GateFacade: any;
