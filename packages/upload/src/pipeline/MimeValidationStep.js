import IUploadPipelineStep from "../contracts/IUploadPipelineStep.js";
import { FileValidationException } from "../exceptions/UploadException.js";

export class MimeValidationStep extends IUploadPipelineStep {
  constructor(allowedMimes = []) {
    super();
    this.allowedMimes = new Set(allowedMimes.map(m => m.toLowerCase()));
  }

  async handle(file, next) {
    if (this.allowedMimes.size > 0 && !this.allowedMimes.has(file.mimeType.toLowerCase())) {
      throw new FileValidationException(`MIME type '${file.mimeType}' is not allowed. Allowed: ${Array.from(this.allowedMimes).join(", ")}`);
    }
    return next(file);
  }
}

export default MimeValidationStep;
