import IUploadPipelineStep from "../contracts/IUploadPipelineStep.js";
import { InvalidMagicBytesException } from "../exceptions/UploadException.js";

export class MagicByteSniffingStep extends IUploadPipelineStep {
  async handle(file, next) {
    const detected = file.detectedMimeType;
    const claimed = file.mimeType.toLowerCase();

    if (claimed.startsWith("image/")) {
      if (!detected.startsWith("image/")) {
        throw new InvalidMagicBytesException(detected, claimed);
      }
    } else if (claimed === "application/pdf") {
      if (detected !== "application/pdf") {
        throw new InvalidMagicBytesException(detected, claimed);
      }
    }

    return next(file);
  }
}

export default MagicByteSniffingStep;
