import UploadPipeline from "../pipeline/UploadPipeline.js";
import UploadProfileRegistry from "../policies/UploadProfileRegistry.js";
import ChunkedUploadSessionManager from "../chunked/ChunkedUploadSessionManager.js";
import SignedUploadManager from "../signed/SignedUploadManager.js";
import QuarantineManager from "../security/QuarantineManager.js";
import UploadTestingFake from "../testing/UploadTestingFake.js";
import UploadManifest from "../core/UploadManifest.js";

export class UploadManager {
  constructor(app = null) {
    this.app = app;
    this.profileRegistry = new UploadProfileRegistry();
    this.chunkedManager = new ChunkedUploadSessionManager();
    this.storageManager = app ? app.make("storage") : null;
    this.signedManager = this.storageManager ? new SignedUploadManager(this.storageManager) : null;
    this.quarantineManager = this.storageManager ? new QuarantineManager(this.storageManager) : null;
    this.fakeHarness = null;
  }

  setStorageManager(storageManager) {
    this.storageManager = storageManager;
    this.signedManager = new SignedUploadManager(storageManager);
    this.quarantineManager = new QuarantineManager(storageManager);

    return this;
  }

  profile(name) {
    return this.profileRegistry.get(name);
  }

  registerProfile(name, pipeline) {
    this.profileRegistry.register(name, pipeline);
    return this;
  }

  async process(uploadedFile, pipelineOrProfile = "avatar") {
    if (this.storageManager) {
      uploadedFile.setStorageManager(this.storageManager);
    }

    const pipeline = typeof pipelineOrProfile === "string" ? this.profile(pipelineOrProfile) : pipelineOrProfile;

    const validatedFile = await pipeline.process(uploadedFile);

    const manifest = new UploadManifest({
      originalName: validatedFile.originalName,
      path: validatedFile.name,
      mimeType: validatedFile.detectedMimeType !== "application/octet-stream" ? validatedFile.detectedMimeType : validatedFile.mimeType,
      size: validatedFile.size,
      hash: validatedFile.hash("sha256")
    });

    if (this.fakeHarness) {
      this.fakeHarness.recordUpload(manifest);
    }

    return { file: validatedFile, manifest };
  }

  chunked() {
    return this.chunkedManager;
  }

  signed() {
    if (!this.signedManager) {
      throw new Error("StorageManager is required for signed uploads.");
    }
    return this.signedManager;
  }

  quarantine() {
    if (!this.quarantineManager) {
      throw new Error("StorageManager is required for file quarantine.");
    }
    return this.quarantineManager;
  }

  fake() {
    this.fakeHarness = new UploadTestingFake(this.storageManager);
    return this.fakeHarness;
  }
}

export default UploadManager;
