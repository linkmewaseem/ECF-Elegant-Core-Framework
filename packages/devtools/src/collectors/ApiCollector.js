export class ApiCollector {
  constructor() {
    this.requests = [];
    this.stats = {
      totalRequests: 0,
      totalBytes: 0,
      p95LatencyMs: 0,
    };
  }

  collectApiCall(requestRecord, routePath, method, status, responseBody, durationMs = 0, meta = {}) {
    const payloadBytes = JSON.stringify(responseBody || {}).length;
    const item = {
      id: `api_${Date.now()}_${Math.random()}`,
      path: routePath,
      method,
      status,
      apiVersion: meta.apiVersion || "v1",
      profile: meta.profile || "desktop",
      payloadBytes,
      durationMs,
      at: Date.now() - (requestRecord?.startedAt || Date.now()),
      timestamp: Date.now(),
    };

    this.requests.push(item);
    this.stats.totalRequests++;
    this.stats.totalBytes += payloadBytes;

    if (requestRecord && typeof requestRecord.addJob === "function") {
      requestRecord.addJob("api", item);
    }
  }

  getSummary() {
    const sortedDurations = [...this.requests.map((r) => r.durationMs)].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedDurations.length * 0.95);
    const p95LatencyMs = sortedDurations.length > 0 ? sortedDurations[p95Index] || 0 : 0;

    return {
      totalRequests: this.stats.totalRequests,
      totalBytes: this.stats.totalBytes,
      p95LatencyMs,
      recentRequests: this.requests.slice(-50),
    };
  }
}

export default ApiCollector;
