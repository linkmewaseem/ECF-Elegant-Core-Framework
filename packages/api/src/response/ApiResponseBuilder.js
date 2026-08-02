import ProblemDetailsResponse from "./ProblemDetailsResponse.js";

export class ApiResponseBuilder {
  static ok(data = {}, headers = {}) {
    const payload = typeof data?.resolve === "function" ? data.resolve() : data;
    return { status: 200, body: payload, headers };
  }

  static created(data = {}, headers = {}) {
    const payload = typeof data?.resolve === "function" ? data.resolve() : data;
    return { status: 201, body: payload, headers };
  }

  static accepted(data = { status: "accepted" }, headers = {}) {
    return { status: 202, body: data, headers };
  }

  static noContent(headers = {}) {
    return { status: 204, body: null, headers };
  }

  static error(message = "API Error", status = 400, details = null) {
    const problem = ProblemDetailsResponse.create({
      status,
      title: "API Error",
      detail: message,
      type: `https://errors.ecf.dev/error-${status}`,
      invalidParams: details,
    });
    return { status, body: problem.toProblemDetails() };
  }

  static validation(errors = {}, message = "Validation Failed") {
    const problem = ProblemDetailsResponse.validation(errors, message);
    return { status: 422, body: problem.toProblemDetails() };
  }

  static notFound(message = "Resource Not Found") {
    const problem = ProblemDetailsResponse.create({
      status: 404,
      title: "Not Found",
      detail: message,
      type: "https://errors.ecf.dev/not-found",
    });
    return { status: 404, body: problem.toProblemDetails() };
  }

  static unauthorized(message = "Authentication Required") {
    const problem = ProblemDetailsResponse.create({
      status: 401,
      title: "Unauthorized",
      detail: message,
      type: "https://errors.ecf.dev/unauthorized",
    });
    return { status: 401, body: problem.toProblemDetails() };
  }

  static forbidden(message = "Access Forbidden") {
    const problem = ProblemDetailsResponse.create({
      status: 403,
      title: "Forbidden",
      detail: message,
      type: "https://errors.ecf.dev/forbidden",
    });
    return { status: 403, body: problem.toProblemDetails() };
  }
}

export default ApiResponseBuilder;
