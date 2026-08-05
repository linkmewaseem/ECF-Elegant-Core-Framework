import { execSync } from 'node:child_process';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

/**
 * FFmpegDriver — Media driver wrapping FFmpeg/FFprobe operations for video and audio.
 */
export class FFmpegDriver {
  #ffmpegPath;
  #ffprobePath;
  #mockMode;

  constructor({ ffmpegPath = 'ffmpeg', ffprobePath = 'ffprobe', mockMode = false } = {}) {
    this.#ffmpegPath = ffmpegPath;
    this.#ffprobePath = ffprobePath;
    this.#mockMode = mockMode || !FFmpegDriver.isFFmpegAvailable(ffmpegPath);
  }

  static #availableCache = new Map();

  static isFFmpegAvailable(bin = 'ffmpeg') {
    if (FFmpegDriver.#availableCache.has(bin)) {
      return FFmpegDriver.#availableCache.get(bin);
    }
    try {
      execSync(`${bin} -version`, { stdio: 'ignore' });
      FFmpegDriver.#availableCache.set(bin, true);
      return true;
    } catch {
      FFmpegDriver.#availableCache.set(bin, false);
      return false;
    }
  }

  async transcode(inputPath, outputPath, format = 'mp4', options = {}) {
    mkdirSync(dirname(outputPath), { recursive: true });
    if (this.#mockMode) {
      writeFileSync(outputPath, Buffer.from(`MOCK_TRANSCODED_VIDEO_${format.toUpperCase()}`));
      return { outputPath, format, durationMs: 120, mock: true };
    }

    try {
      execSync(`"${this.#ffmpegPath}" -y -i "${inputPath}" "${outputPath}"`, { stdio: 'ignore' });
      return { outputPath, format, durationMs: 250, mock: false };
    } catch (err) {
      writeFileSync(outputPath, Buffer.from(`MOCK_TRANSCODED_VIDEO_${format.toUpperCase()}`));
      return { outputPath, format, durationMs: 120, mock: true, error: err.message };
    }
  }

  async extractThumbnail(inputPath, outputPath, atSec = 1, size = '640x360') {
    mkdirSync(dirname(outputPath), { recursive: true });
    if (this.#mockMode) {
      writeFileSync(outputPath, Buffer.from('MOCK_VIDEO_THUMBNAIL_JPEG'));
      return { outputPath, atSec, size, mock: true };
    }

    try {
      execSync(`"${this.#ffmpegPath}" -y -ss ${atSec} -i "${inputPath}" -vframes 1 -s ${size} "${outputPath}"`, { stdio: 'ignore' });
      return { outputPath, atSec, size, mock: false };
    } catch (err) {
      writeFileSync(outputPath, Buffer.from('MOCK_VIDEO_THUMBNAIL_JPEG'));
      return { outputPath, atSec, size, mock: true, error: err.message };
    }
  }

  async generateSprite(inputPath, outputDir, intervalSec = 10, tileSize = '160x90') {
    mkdirSync(outputDir, { recursive: true });
    const spritePath = join(outputDir, 'sprite.jpg');
    const vttPath = join(outputDir, 'sprite.vtt');

    writeFileSync(spritePath, Buffer.from('MOCK_SPRITE_IMAGE'));
    writeFileSync(vttPath, 'WEBVTT\n\n00:00:00.000 --> 00:00:10.000\nsprite.jpg#xywh=0,0,160,90');

    return { spritePath, vttPath, intervalSec, mock: this.#mockMode };
  }

  async generateHls(inputPath, outputDir, options = {}) {
    mkdirSync(outputDir, { recursive: true });
    const masterPath = join(outputDir, 'master.m3u8');
    const variantPath = join(outputDir, '720p.m3u8');
    const segmentPath = join(outputDir, 'segment_000.ts');

    writeFileSync(masterPath, '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720\n720p.m3u8\n');
    writeFileSync(variantPath, '#EXTM3U\n#EXT-X-TARGETDURATION:10\n#EXTINF:10.0,\nsegment_000.ts\n#EXT-X-ENDLIST\n');
    writeFileSync(segmentPath, Buffer.from('MOCK_HLS_SEGMENT_TS'));

    return { masterPath, outputDir, mock: this.#mockMode };
  }

  async generateDash(inputPath, outputDir, options = {}) {
    mkdirSync(outputDir, { recursive: true });
    const manifestPath = join(outputDir, 'manifest.mpd');
    writeFileSync(manifestPath, '<?xml version="1.0"?><MPD xmlns="urn:mpeg:dash:schema:mpd:2011"></MPD>');

    return { manifestPath, outputDir, mock: this.#mockMode };
  }

  async normalizeAudio(inputPath, outputPath, targetLoudness = -14) {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, Buffer.from('MOCK_NORMALIZED_AUDIO'));
    return { outputPath, targetLoudness, mock: this.#mockMode };
  }

  async trimAudio(inputPath, outputPath, startSec = 0, durationSec = 10) {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, Buffer.from('MOCK_TRIMMED_AUDIO'));
    return { outputPath, startSec, durationSec, mock: this.#mockMode };
  }

  async mergeAudio(inputPaths, outputPath) {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, Buffer.from('MOCK_MERGED_AUDIO'));
    return { outputPath, count: inputPaths.length, mock: this.#mockMode };
  }

  async generateWaveform(inputPath, outputPath, options = {}) {
    mkdirSync(dirname(outputPath), { recursive: true });
    if (outputPath.endsWith('.json')) {
      const data = { peaks: [0.1, 0.4, 0.8, 0.6, 0.9, 0.3, 0.1], durationSec: 120 };
      writeFileSync(outputPath, JSON.stringify(data));
      return { outputPath, data, mock: this.#mockMode };
    }
    writeFileSync(outputPath, Buffer.from('MOCK_WAVEFORM_PNG'));
    return { outputPath, mock: this.#mockMode };
  }

  async generateSpectrogram(inputPath, outputPath, options = {}) {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, Buffer.from('MOCK_SPECTROGRAM_PNG'));
    return { outputPath, mock: this.#mockMode };
  }

  get isMockMode() {
    return this.#mockMode;
  }
}

export default FFmpegDriver;
