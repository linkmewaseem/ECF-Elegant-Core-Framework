export class ApiFake {
  constructor() {
    this.calls = [];
  }

  recordCall(path, method, status, responseBody = {}, headers = {}, meta = {}) {
    const item = {
      path,
      method: method.toUpperCase(),
      status,
      body: responseBody,
      headers,
      apiVersion: meta.apiVersion || "v1",
      isProblem: Boolean(responseBody && responseBody.type && responseBody.title),
      isPaginated: Boolean(responseBody && (responseBody.meta || responseBody.links)),
      timestamp: Date.now(),
    };
    this.calls.push(item);
    return item;
  }

  assertCalled(pathFilter) {
    const matched = this.calls.filter((item) => {
      return typeof pathFilter === "string" ? item.path.includes(pathFilter) : pathFilter.test(item.path);
    });
    if (matched.length === 0) {
      throw new Error(`Api assertion failed: Expected route [${pathFilter}] was not called.`);
    }
    return true;
  }

  assertStatus(expectedStatus) {
    const matched = this.calls.filter((item) => item.status === expectedStatus);
    if (matched.length === 0) {
      throw new Error(`Api assertion failed: Expected status [${expectedStatus}], but calls had statuses [${this.calls.map((c) => c.status).join(", ")}].`);
    }
    return true;
  }

  assertRateLimited() {
    return this.assertStatus(429);
  }

  assertVersion(expectedVersion) {
    const matched = this.calls.filter((item) => item.apiVersion === expectedVersion);
    if (matched.length === 0) {
      throw new Error(`Api assertion failed: Expected API version [${expectedVersion}].`);
    }
    return true;
  }

  assertProblem() {
    const matched = this.calls.filter((item) => item.isProblem);
    if (matched.length === 0) {
      throw new Error(`Api assertion failed: Expected RFC-9457 Problem Details error response.`);
    }
    return true;
  }

  assertPaginated() {
    const matched = this.calls.filter((item) => item.isPaginated);
    if (matched.length === 0) {
      throw new Error(`Api assertion failed: Expected paginated resource collection response.`);
    }
    return true;
  }

  reset() {
    this.calls = [];
  }
}

export default ApiFake;
