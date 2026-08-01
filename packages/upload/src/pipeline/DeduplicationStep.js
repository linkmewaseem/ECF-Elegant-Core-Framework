import IUploadPipelineStep from "../contracts/IUploadPipelineStep.js";

export class DeduplicationStep extends IUploadPipelineStep {
  constructor(deduplicationEngine) {
    super();
    this.deduplicationEngine = deduplicationEngine;
  }

  async handle(file, next) {
    if (this.deduplicationEngine) {
      const hash = file.hash("sha256");
      const existing = await this.deduplicationEngine.findExisting(hash);
      if (existing) {
        file.deduplicated = true;
        file.existingManifest = existing;
      }
    }
    return next(file);
  }
}

export default DeduplicationStep;
