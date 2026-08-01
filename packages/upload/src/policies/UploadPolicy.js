import IUploadPolicy from "../contracts/IUploadPolicy.js";
import UploadPipeline from "../pipeline/UploadPipeline.js";

export class UploadPolicy extends IUploadPolicy {
  constructor() {
    super();
    this.pipeline = new UploadPipeline();
  }

  allowedMimes() { return []; }
  maxSize() { return Infinity; }
  minSize() { return 0; }
  dimensions() { return { minWidth: 0, maxWidth: Infinity, minHeight: 0, maxHeight: Infinity }; }

  async validate(uploadedFile) {
    return this.pipeline.process(uploadedFile);
  }
}

export default UploadPolicy;
