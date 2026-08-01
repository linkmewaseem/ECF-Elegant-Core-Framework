import IUploadPipelineStep from "../contracts/IUploadPipelineStep.js";
import { VirusDetectedException } from "../exceptions/UploadException.js";

export class VirusScanStep extends IUploadPipelineStep {
  constructor(scanner, quarantineManager = null) {
    super();
    this.scanner = scanner;
    this.quarantineManager = quarantineManager;
  }

  async handle(file, next) {
    if (this.scanner) {
      const res = await this.scanner.scan(file.buffer, file.originalName);
      if (res.isInfected) {
        if (this.quarantineManager) {
          await this.quarantineManager.quarantine(file, `Virus: ${res.threatName}`);
        }
        throw new VirusDetectedException(file.originalName, res.threatName);
      }
    }
    return next(file);
  }
}

export default VirusScanStep;
