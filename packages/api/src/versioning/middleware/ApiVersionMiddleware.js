export class ApiVersionMiddleware {
  constructor(versionManager) {
    this.versionManager = versionManager;
  }

  async handle(req, res, next) {
    const version = this.versionManager.resolveVersion(req);
    req.apiVersion = version;
    if (res && typeof res.setHeader === "function") {
      res.setHeader("X-Api-Version", version);
    }
    return await next();
  }
}

export default ApiVersionMiddleware;
