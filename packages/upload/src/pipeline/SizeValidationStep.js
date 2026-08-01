import IUploadPipelineStep from "../contracts/IUploadPipelineStep.js";
import { FileValidationException } from "../exceptions/UploadException.js";

export class SizeValidationStep extends IUploadPipelineStep {
  constructor(options = {}) {
    super();
    this.minSize = options.minSize ?? 0;
    this.maxSize = options.maxSize ?? Infinity;
  }

  async handle(file, next) {
    if (file.size < this.minSize) {
      throw new FileValidationException(`File size (${file.size} bytes) is less than minimum allowed (${this.minSize} bytes).`);
    }
    if (file.size > this.maxSize) {
      throw new FileValidationException(`File size (${file.size} bytes) exceeds maximum allowed (${this.maxSize} bytes).`);
    }
    return next(file);
  }
}

export default SizeValidationStep;
