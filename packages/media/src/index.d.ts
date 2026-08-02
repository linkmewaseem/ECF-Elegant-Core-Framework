import { ServiceProvider } from '@ecf/core';

export class MediaFile {
  static fromBuffer(buffer: Buffer, options?: { mimeType?: string; originalName?: string }): MediaFile;
  static fromPath(filePath: string): MediaFile;
  static fromUploadedFile(uploadedFile: any): MediaFile;

  getMimeType(): string;
  getOriginalName(): string;
  getSize(): number;
  getPath(): string | null;
  getBuffer(): Buffer | null;

  isImage(): boolean;
  isVideo(): boolean;
  isAudio(): boolean;

  toObject(): Record<string, any>;
}

export class MediaMetadata {
  format: string;
  width: number;
  height: number;
  size: number;
  aspectRatio: number;
  isPortrait: boolean;
  exif: Record<string, any>;
  gps: { latitude: number; longitude: number } | null;
  animated: boolean;

  constructor(data?: Partial<MediaMetadata>);
  toObject(): Record<string, any>;
}

export class MediaResult {
  originalName: string;
  storedPath: string;
  url: string;
  variants: Record<string, string>;
  metadata: MediaMetadata;
  trace: any[];

  constructor(data: Partial<MediaResult>);
}

export class VideoProcessor {
  constructor(driver: any, inputFile: any);
  transcode(format?: string, options?: Record<string, any>): this;
  thumbnail(atSec?: number, size?: string): this;
  sprite(intervalSec?: number, tileSize?: string): this;
  hls(options?: Record<string, any>): this;
  dash(options?: Record<string, any>): this;
  adaptiveBitrate(resolutions?: string[]): this;
  process(outputDir: string): Promise<Record<string, any>>;
  getOptions(): Record<string, any>;
  getInputFile(): any;
}

export class AudioProcessor {
  constructor(driver: any, inputFile: any);
  normalize(targetLoudness?: number): this;
  trim(startSec?: number, durationSec?: number): this;
  merge(files?: string[] | string): this;
  waveform(extOrPath?: string, options?: Record<string, any>): this;
  spectrogram(options?: Record<string, any>): this;
  process(outputDir: string): Promise<Record<string, any>>;
  getOptions(): Record<string, any>;
  getInputFile(): any;
}

export class FFmpegDriver {
  constructor(options?: { ffmpegPath?: string; ffprobePath?: string; mockMode?: boolean });
  static isFFmpegAvailable(bin?: string): boolean;
  transcode(inputPath: string, outputPath: string, format?: string, options?: Record<string, any>): Promise<Record<string, any>>;
  extractThumbnail(inputPath: string, outputPath: string, atSec?: number, size?: string): Promise<Record<string, any>>;
  generateSprite(inputPath: string, outputDir: string, intervalSec?: number, tileSize?: string): Promise<Record<string, any>>;
  generateHls(inputPath: string, outputDir: string, options?: Record<string, any>): Promise<Record<string, any>>;
  generateDash(inputPath: string, outputDir: string, options?: Record<string, any>): Promise<Record<string, any>>;
  normalizeAudio(inputPath: string, outputPath: string, targetLoudness?: number): Promise<Record<string, any>>;
  trimAudio(inputPath: string, outputPath: string, startSec?: number, durationSec?: number): Promise<Record<string, any>>;
  mergeAudio(inputPaths: string[], outputPath: string): Promise<Record<string, any>>;
  generateWaveform(inputPath: string, outputPath: string, options?: Record<string, any>): Promise<Record<string, any>>;
  generateSpectrogram(inputPath: string, outputPath: string, options?: Record<string, any>): Promise<Record<string, any>>;
  readonly isMockMode: boolean;
}

export class ImageProcessor {
  constructor(inputFile: MediaFile, driver: any, services?: Record<string, any>);
  resize(width: number, height?: number, options?: Record<string, any>): this;
  fit(width: number, height: number, position?: string): this;
  crop(width: number, height: number, x?: number, y?: number): this;
  format(fmt: string): this;
  jpeg(quality?: number): this;
  png(compressionLevel?: number): this;
  webp(quality?: number): this;
  avif(quality?: number): this;
  optimize(quality?: number): this;
  watermark(overlay: string | Buffer, options?: Record<string, any>): this;
  grayscale(): this;
  blur(sigma?: number): this;
  stripMetadata(): this;
  profile(profileName: string): this;
  store(directory: string, disk?: string): Promise<MediaResult>;
}

export class MediaManager {
  image(source: any, driverName?: string | null): ImageProcessor;
  video(source: any, driverName?: string | null): VideoProcessor;
  audio(source: any, driverName?: string | null): AudioProcessor;
  imageRaw(buffer: Buffer, opts?: Record<string, any>): ImageProcessor;
  metadata(source: any): Promise<MediaMetadata>;
  extend(name: string, driverInstance: any): this;
  defineProfile(name: string): any;
  useImageDriver(name: string): this;
  availableDrivers(): string[];
}

export const MediaFacade: any;
export const Media: any;

export class MediaServiceProvider extends ServiceProvider {
  register(app: any): void;
  boot(app: any): void;
}

export class MediaTestingFake {
  static create(): MediaTestingFake;
  getFakeDriver(): any;
  reset(): void;
  assertProcessed(count?: number | null): void;
  assertNotProcessed(): void;
  assertHasTransformation(type: string, callIndex?: number): void;
  assertResized(width: number, height?: number, callIndex?: number): void;
  assertFormat(format: string, callIndex?: number): void;
  assertMetadataStripped(callIndex?: number): void;
  assertWatermarked(callIndex?: number): void;
  assertGrayscale(callIndex?: number): void;
  assertBlurred(callIndex?: number): void;
  assertVariantCount(count: number, callIndex?: number): void;
  assertVariant(variantName: string): void;
  assertStoredIn(directory: string, callIndex?: number): void;
  recordResult(result: any): void;
  getCalls(): any[];
  callCount(): number;
}
