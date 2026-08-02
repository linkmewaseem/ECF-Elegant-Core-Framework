import ApiResource, { ResourceCollection } from "./resources/ApiResource.js";
import ApiVersionManager from "./versioning/ApiVersionManager.js";
import ApiRateLimiter from "./ratelimit/ApiRateLimiter.js";
import OpenApiGenerator from "./openapi/OpenApiGenerator.js";
import ApiResponseBuilder from "./response/ApiResponseBuilder.js";
import ProblemDetailsResponse from "./response/ProblemDetailsResponse.js";
import ApiProfileManager from "./profiles/ApiProfileManager.js";
import ApiAuthGuard from "./security/ApiAuthGuard.js";
import ApiFake from "./testing/ApiFake.js";

export class ApiManager {
  constructor(config = {}, container = null) {
    this.config = config;
    this.container = container;
    this.versionManager = new ApiVersionManager(config.defaultVersion || "v1", config.supportedVersions || ["v1", "v2"]);
    this.rateLimiter = new ApiRateLimiter(config.cacheDriver);
    this.openApiGenerator = new OpenApiGenerator(config.title, config.version, config.description);
    this.profileManager = new ApiProfileManager();
    this.authGuard = new ApiAuthGuard(container?.has("auth") ? container.make("auth") : null);
    this.activeProfileName = "desktop";
  }

  resource(data, resourceClass = ApiResource) {
    return new resourceClass(data);
  }

  collection(data, resourceClass = ApiResource) {
    return new ResourceCollection(data, resourceClass);
  }

  version(ver) {
    this.versionManager.defaultVersion = ver;
    return this;
  }

  profile(name) {
    this.activeProfileName = name;
    return this;
  }

  getProfileConfig() {
    return this.profileManager.getProfile(this.activeProfileName);
  }

  ok(data, headers) {
    return ApiResponseBuilder.ok(data, headers);
  }

  created(data, headers) {
    return ApiResponseBuilder.created(data, headers);
  }

  accepted(data, headers) {
    return ApiResponseBuilder.accepted(data, headers);
  }

  noContent(headers) {
    return ApiResponseBuilder.noContent(headers);
  }

  error(message, status, details) {
    return ApiResponseBuilder.error(message, status, details);
  }

  validation(errors, message) {
    return ApiResponseBuilder.validation(errors, message);
  }

  notFound(message) {
    return ApiResponseBuilder.notFound(message);
  }

  unauthorized(message) {
    return ApiResponseBuilder.unauthorized(message);
  }

  forbidden(message) {
    return ApiResponseBuilder.forbidden(message);
  }

  fake() {
    this.fakeHarness = new ApiFake();
    return this.fakeHarness;
  }
}

export default ApiManager;
