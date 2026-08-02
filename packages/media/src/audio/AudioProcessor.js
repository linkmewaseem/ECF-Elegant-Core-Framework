import { join } from 'node:path';

/**
 * AudioProcessor — Fluent API builder for audio normalization, trimming, merging, waveforms, and spectrograms.
 */
export class AudioProcessor {
  #driver;
  #inputFile;
  #options = {
    normalizeOpts: null,
    trimOpts: null,
    mergeFiles: [],
    waveformOpts: null,
    spectrogramOpts: null,
  };

  constructor(driver, inputFile) {
    this.#driver = driver;
    this.#inputFile = inputFile;
  }

  normalize(targetLoudness = -14) {
    this.#options.normalizeOpts = { targetLoudness };
    return this;
  }

  trim(startSec = 0, durationSec = 10) {
    this.#options.trimOpts = { startSec, durationSec };
    return this;
  }

  merge(files = []) {
    this.#options.mergeFiles = Array.isArray(files) ? files : [files];
    return this;
  }

  waveform(extOrPath = 'json', options = {}) {
    this.#options.waveformOpts = { format: extOrPath.includes('.') ? extOrPath.split('.').pop() : extOrPath, options };
    return this;
  }

  spectrogram(options = {}) {
    this.#options.spectrogramOpts = options;
    return this;
  }

  async process(outputDir) {
    const inputPath = typeof this.#inputFile === 'string' ? this.#inputFile : this.#inputFile.getPath?.() ?? 'audio.mp3';
    const results = { inputPath, outputDir, outputs: {} };

    if (this.#options.normalizeOpts) {
      const normPath = join(outputDir, 'normalized.mp3');
      results.outputs.normalize = await this.#driver.normalizeAudio(inputPath, normPath, this.#options.normalizeOpts.targetLoudness);
    }

    if (this.#options.trimOpts) {
      const trimPath = join(outputDir, 'trimmed.mp3');
      results.outputs.trim = await this.#driver.trimAudio(inputPath, trimPath, this.#options.trimOpts.startSec, this.#options.trimOpts.durationSec);
    }

    if (this.#options.mergeFiles.length > 0) {
      const mergePath = join(outputDir, 'merged.mp3');
      const allFiles = [inputPath, ...this.#options.mergeFiles];
      results.outputs.merge = await this.#driver.mergeAudio(allFiles, mergePath);
    }

    if (this.#options.waveformOpts) {
      const fmt = this.#options.waveformOpts.format;
      const wfPath = join(outputDir, `waveform.${fmt}`);
      results.outputs.waveform = await this.#driver.generateWaveform(inputPath, wfPath, this.#options.waveformOpts.options);
    }

    if (this.#options.spectrogramOpts) {
      const specPath = join(outputDir, 'spectrogram.png');
      results.outputs.spectrogram = await this.#driver.generateSpectrogram(inputPath, specPath, this.#options.spectrogramOpts);
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

export default AudioProcessor;
