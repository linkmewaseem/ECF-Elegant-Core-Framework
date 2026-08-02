import { join } from 'node:path';

/**
 * VideoProcessor — Fluent API builder for video transcoding, thumbnailing, sprite, and streaming manifests.
 */
export class VideoProcessor {
  #driver;
  #inputFile;
  #options = {
    transcodeFormat: null,
    transcodeOpts: {},
    thumbnailOpts: null,
    spriteOpts: null,
    hlsOpts: null,
    dashOpts: null,
    adaptiveBitrateOpts: null,
  };

  constructor(driver, inputFile) {
    this.#driver = driver;
    this.#inputFile = inputFile;
  }

  transcode(format = 'mp4', options = {}) {
    this.#options.transcodeFormat = format;
    this.#options.transcodeOpts = options;
    return this;
  }

  thumbnail(atSec = 1, size = '640x360') {
    this.#options.thumbnailOpts = { atSec, size };
    return this;
  }

  sprite(intervalSec = 10, tileSize = '160x90') {
    this.#options.spriteOpts = { intervalSec, tileSize };
    return this;
  }

  hls(options = {}) {
    this.#options.hlsOpts = options;
    return this;
  }

  dash(options = {}) {
    this.#options.dashOpts = options;
    return this;
  }

  adaptiveBitrate(resolutions = ['1080p', '720p', '480p']) {
    this.#options.adaptiveBitrateOpts = { resolutions };
    return this;
  }

  async process(outputDir) {
    const inputPath = typeof this.#inputFile === 'string' ? this.#inputFile : this.#inputFile.getPath?.() ?? 'video.mp4';
    const results = { inputPath, outputDir, outputs: {} };

    if (this.#options.transcodeFormat) {
      const targetPath = join(outputDir, `video.${this.#options.transcodeFormat}`);
      results.outputs.transcode = await this.#driver.transcode(inputPath, targetPath, this.#options.transcodeFormat, this.#options.transcodeOpts);
    }

    if (this.#options.thumbnailOpts) {
      const thumbPath = join(outputDir, 'thumbnail.jpg');
      results.outputs.thumbnail = await this.#driver.extractThumbnail(inputPath, thumbPath, this.#options.thumbnailOpts.atSec, this.#options.thumbnailOpts.size);
    }

    if (this.#options.spriteOpts) {
      const spriteDir = join(outputDir, 'sprites');
      results.outputs.sprite = await this.#driver.generateSprite(inputPath, spriteDir, this.#options.spriteOpts.intervalSec, this.#options.spriteOpts.tileSize);
    }

    if (this.#options.hlsOpts) {
      const hlsDir = join(outputDir, 'hls');
      results.outputs.hls = await this.#driver.generateHls(inputPath, hlsDir, this.#options.hlsOpts);
    }

    if (this.#options.dashOpts) {
      const dashDir = join(outputDir, 'dash');
      results.outputs.dash = await this.#driver.generateDash(inputPath, dashDir, this.#options.dashOpts);
    }

    return results;
  }

  getOptions() {
    return { ...this.#options };
  }

  getInputFile() {
    return this.#inputFile;
  }
}

export default VideoProcessor;
