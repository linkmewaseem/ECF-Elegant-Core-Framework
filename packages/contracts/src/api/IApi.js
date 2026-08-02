export class IApiManager {
  resource(data, resourceClass = null) {}
  collection(data, resourceClass = null) {}
  version(version) {}
  profile(name) {}
  fake() {}
}

export class IApiResource {
  toArray() {}
  when(condition, value, defaultValue = null) {}
  merge(data) {}
  mergeWhen(condition, data) {}
  whenLoaded(relationship, value = null, defaultValue = null) {}
  whenCounted(relationship, value = null, defaultValue = null) {}
}

export class IApiVersionManager {
  resolveVersion(request) {}
  supports(version) {}
}

export class IOpenApiGenerator {
  generate(routes = []) {}
}

export class IApiRateLimiter {
  checkRateLimit(key, limit = 60, windowMs = 60000) {}
}

export class IProblemDetails {
  toProblemDetails() {}
}
