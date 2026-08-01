import UploadPipeline from "../pipeline/UploadPipeline.js";
import MimeValidationStep from "../pipeline/MimeValidationStep.js";
import SizeValidationStep from "../pipeline/SizeValidationStep.js";
import DimensionValidationStep from "../pipeline/DimensionValidationStep.js";
import MagicByteSniffingStep from "../pipeline/MagicByteSniffingStep.js";

export class UploadProfileRegistry {
  constructor() {
    this.profiles = new Map();

    // Default profiles out of the box
    this.register("avatar", new UploadPipeline([
      new MagicByteSniffingStep(),
      new MimeValidationStep(["image/jpeg", "image/png", "image/webp"]),
      new SizeValidationStep({ maxSize: 5 * 1024 * 1024 }), // 5MB
      new DimensionValidationStep({ minWidth: 50, maxWidth: 4096, minHeight: 50, maxHeight: 4096 })
    ]));

    this.register("document", new UploadPipeline([
      new MagicByteSniffingStep(),
      new MimeValidationStep(["application/pdf", "image/jpeg", "image/png"]),
      new SizeValidationStep({ maxSize: 20 * 1024 * 1024 }) // 20MB
    ]));
  }

  register(name, pipeline) {
    this.profiles.set(name, pipeline);
    return this;
  }

  get(name) {
    if (!this.profiles.has(name)) {
      throw new Error(`Upload profile '${name}' is not registered.`);
    }
    return this.profiles.get(name);
  }
}

export default UploadProfileRegistry;
