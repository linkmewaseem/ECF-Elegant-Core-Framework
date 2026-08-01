import IUploadPipelineStep from "../contracts/IUploadPipelineStep.js";
import { FileValidationException } from "../exceptions/UploadException.js";

export class DimensionValidationStep extends IUploadPipelineStep {
  constructor(options = {}) {
    super();
    this.minWidth = options.minWidth ?? 0;
    this.maxWidth = options.maxWidth ?? Infinity;
    this.minHeight = options.minHeight ?? 0;
    this.maxHeight = options.maxHeight ?? Infinity;
  }

  async handle(file, next) {
    const dim = file.dimensions();
    if (dim.valid) {
      if (dim.width < this.minWidth || dim.width > this.maxWidth) {
        throw new FileValidationException(`Image width (${dim.width}px) must be between ${this.minWidth}px and ${this.maxWidth}px.`);
      }
      if (dim.height < this.minHeight || dim.height > this.maxHeight) {
        throw new FileValidationException(`Image height (${dim.height}px) must be between ${this.minHeight}px and ${this.maxHeight}px.`);
      }
    }
    return next(file);
  }
}

export default DimensionValidationStep;
