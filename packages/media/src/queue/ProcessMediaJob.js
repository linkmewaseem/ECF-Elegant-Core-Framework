/**
 * ProcessMediaJob — Background queue job for heavy media processing.
 *
 * Dispatched automatically when .queueOn(disk) is called on ImageProcessor.
 * Integrates with @ecf/queue via duck-typing (no hard dependency on Job base class).
 */
export class ProcessMediaJob {
  constructor({ mediaFile, transformations = [], variants = {}, profileName = null, disk = "local", directory = "media" }) {
    this.mediaFile = mediaFile;
    this.transformations = transformations;
    this.variants = variants;
    this.profileName = profileName;
    this.disk = disk;
    this.directory = directory;

    // @ecf/queue job metadata
    this.jobName = "ProcessMediaJob";
    this.maxAttempts = 3;
    this.backoff = { type: "exponential", delay: 5000 };
    this.timeout = 120_000; // 2 minutes max per media job
  }

  async handle(container) {
    const media = container.make("media");
    const processor = media.image(this.mediaFile);

    // Replay transformations
    for (const t of this.transformations) {
      if (typeof processor[t.type] === "function") {
        processor[t.type](...(t.args ?? []));
      }
    }

    // Replay variants
    for (const [name, opts] of Object.entries(this.variants)) {
      processor.variant(name, opts);
    }

    if (this.profileName) {
      processor.profile(this.profileName);
    }

    return await processor.store(this.directory, this.disk);
  }

  failed(error) {
    console.error(`[ProcessMediaJob] Failed after ${this.maxAttempts} attempts:`, error.message);
  }
}

export default ProcessMediaJob;
