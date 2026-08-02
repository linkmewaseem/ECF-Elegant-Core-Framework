import IProblemDetails from "../contracts/IProblemDetails.js";

export class ProblemDetailsResponse extends IProblemDetails {
  constructor({
    status = 500,
    title = "Internal Server Error",
    detail = "An unexpected error occurred on the server.",
    type = "https://errors.ecf.dev/internal-error",
    instance = null,
    invalidParams = null,
  } = {}) {
    super();
    this.status = status;
    this.title = title;
    this.detail = detail;
    this.type = type;
    this.instance = instance;
    this.invalidParams = invalidParams;
  }

  static create(options = {}) {
    return new ProblemDetailsResponse(options);
  }

  static validation(invalidParams = {}, detail = "One or more validation constraints failed.") {
    return new ProblemDetailsResponse({
      status: 422,
      title: "Unprocessable Entity",
      detail,
      type: "https://errors.ecf.dev/validation-error",
      invalidParams,
    });
  }

  toProblemDetails() {
    const payload = {
      type: this.type,
      title: this.title,
      status: this.status,
      detail: this.detail,
    };
    if (this.instance) payload.instance = this.instance;
    if (this.invalidParams) payload.invalid_params = this.invalidParams;
    return payload;
  }
}

export default ProblemDetailsResponse;
