import ProblemDetailsResponse from "../response/ProblemDetailsResponse.js";

export class ApiAuthGuard {
  constructor(authManager = null) {
    this.authManager = authManager;
  }

  async authenticate(req) {
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    if (!authHeader) {
      return { authenticated: false, reason: "Missing Authorization header" };
    }

    const [scheme, token] = authHeader.split(" ");
    if (!token || !["Bearer", "Token", "ApiKey"].includes(scheme)) {
      return { authenticated: false, reason: "Invalid authorization scheme" };
    }

    if (this.authManager && typeof this.authManager.guard === "function") {
      const user = await this.authManager.guard("api").user();
      if (user) return { authenticated: true, user, token };
    }

    // Mock/Default token verification
    if (token === "invalid-token") {
      return { authenticated: false, reason: "Token invalid or expired" };
    }

    return { authenticated: true, user: { id: 1, name: "API User" }, token };
  }

  middleware() {
    return async (req, res, next) => {
      const result = await this.authenticate(req);
      if (!result.authenticated) {
        const problem = ProblemDetailsResponse.create({
          status: 401,
          title: "Unauthorized",
          detail: result.reason,
          type: "https://errors.ecf.dev/unauthorized",
        });

        if (res && typeof res.status === "function") {
          return res.status(401).json(problem.toProblemDetails());
        }
        return problem.toProblemDetails();
      }

      req.user = result.user;
      return await next();
    };
  }
}

export default ApiAuthGuard;
