export class ApiVersionManager {
  constructor(defaultVersion = "v1", supportedVersions = ["v1", "v2"]) {
    this.defaultVersion = defaultVersion;
    this.supportedVersions = new Set(supportedVersions);
  }

  supports(version) {
    return this.supportedVersions.has(version);
  }

  resolveVersion(request = {}) {
    // 1. URI path versioning (/api/v1/...)
    if (request.url || request.path) {
      const path = request.url || request.path;
      const match = path.match(/\/api\/(v[0-9]+)\//i);
      if (match && this.supports(match[1].toLowerCase())) {
        return match[1].toLowerCase();
      }
    }

    // 2. Custom X-Api-Version Header
    const headerVer = request.headers?.["x-api-version"] || request.headers?.["X-Api-Version"];
    if (headerVer && this.supports(headerVer.toLowerCase())) {
      return headerVer.toLowerCase();
    }

    // 3. Accept Header (application/vnd.ecf.v2+json)
    const acceptHeader = request.headers?.["accept"] || request.headers?.["Accept"];
    if (acceptHeader) {
      const match = acceptHeader.match(/vnd\.ecf\.(v[0-9]+)\+json/i);
      if (match && this.supports(match[1].toLowerCase())) {
        return match[1].toLowerCase();
      }
    }

    // 4. Query param (?v=2 or ?version=v2)
    if (request.query) {
      const q = request.query.v || request.query.version;
      const formatted = q && (q.startsWith("v") ? q : `v${q}`);
      if (formatted && this.supports(formatted.toLowerCase())) {
        return formatted.toLowerCase();
      }
    }

    return this.defaultVersion;
  }
}

export default ApiVersionManager;
