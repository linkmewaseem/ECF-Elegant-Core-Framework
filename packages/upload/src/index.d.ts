export class MagicByteSniffer {
  static sniff(buffer: Buffer): string;
}

export class ImageDimensionParser {
  static parse(buffer: Buffer): { width: number; height: number; valid: boolean };
}

export class UploadPathSanitizer {
  static sanitize(originalName: string): string;
}

export class UploadedFile {
  originalName: string;
  name: string;
  mimeType: string;
  detectedMimeType: string;
  extension: string;
  size: number;
  buffer: Buffer;

  hash(algo?: string): string;
  dimensions(): { width: number; height: number; valid: boolean };
  isValid(): boolean;
  store(targetPath?: string, disk?: string): Promise<any>;
  storeAs(targetPath?: string, name?: string, disk?: string, options?: any): Promise<any>;
  storePublicly(targetPath?: string, disk?: string): Promise<any>;

  static fake(fileName?: string, options?: any): UploadedFile;
}

export class UploadManifest {
  id: string;
  disk: string;
  path: string;
  originalName: string;
  mimeType: string;
  size: number;
  hash: string | null;
  visibility: string;
}

export class UploadPipeline {
  addStep(step: any): this;
  process(uploadedFile: UploadedFile): Promise<UploadedFile>;
}

export class UploadException extends Error {
  status: number;
  code: string;
}
export class FileValidationException extends UploadException {}
export class InvalidMagicBytesException extends UploadException {}
export class UploadSessionExpiredException extends UploadException {}
export class VirusDetectedException extends UploadException {}

export class ChunkedUploadSessionManager {
  initiate(fileName: string, totalSize: number, chunkSize?: number): string;
  appendChunk(sessionId: string, chunkIndex: number, buffer: Buffer): any;
  status(sessionId: string): any;
  assemble(sessionId: string): UploadedFile;
  cleanupAbandoned(maxAgeMs?: number): number;
}

export class UploadManager {
  process(uploadedFile: UploadedFile, pipelineOrProfile?: any): Promise<{ file: UploadedFile; manifest: UploadManifest }>;
  profile(name: string): UploadPipeline;
  chunked(): ChunkedUploadSessionManager;
  signed(): any;
  quarantine(): any;
  fake(): UploadTestingFake;
}

export class UploadTestingFake {
  fakeFile(name?: string, options?: any): UploadedFile;
  assertUploaded(fileName: string): void;
  assertCount(expectedCount: number): void;
}

export class UploadServiceProvider {
  register(app: any): void;
  boot(app: any): void;
}

export const Upload: any;
