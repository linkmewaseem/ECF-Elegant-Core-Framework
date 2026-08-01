export class IAuthenticationRateLimiter {
  tooManyAttempts(key, maxAttempts) { throw new Error("Method not implemented."); }
  hit(key, decaySeconds = 60) { throw new Error("Method not implemented."); }
  attempts(key) { throw new Error("Method not implemented."); }
  resetAttempts(key) { throw new Error("Method not implemented."); }
  availableIn(key) { throw new Error("Method not implemented."); }
}
export default IAuthenticationRateLimiter;
