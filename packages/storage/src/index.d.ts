import { Readable } from "node:stream";

export class StoragePath {
  static normalize(path: string): string;
  static join(...parts: string[]): string;
}

export class StorageResult {
  success: boolean;
  path: string;
  disk: string;
  size: number;
  checksum: string | null;
  mime: string;
  visibility: string;
  duration: number;
  driver: string;
  error: string | null;
}

export class FileMetadata {
  path: string;
  disk: string;
  size: number;
  mimeType: string;
  lastModified: Date;
  etag: string | null;
  checksum: string | null;
  visibility: string;
  isFile: boolean;
  isDirectory: boolean;
}

export class IFilesystem {
  put(path: string, contents: any, options?: any): Promise<StorageResult>;
  get(path: string): Promise<string>;
  exists(path: string): Promise<boolean>;
  delete(path: string): Promise<boolean>;
  copy(source: string, destination: string): Promise<boolean>;
  move(source: string, destination: string): Promise<boolean>;
  readStream(path: string): Promise<Readable>;
  writeStream(path: string, stream: Readable, options?: any): Promise<boolean>;
  metadata(path: string): Promise<FileMetadata>;
  temporaryUrl(path: string, expiration?: number): Promise<string>;
  checksum(path: string, algo?: string): Promise<string>;
}

export class IStorageManager {
  disk(name?: string | null): IFilesystem;
  extend(driverName: string, creator: Function): this;
  fake(diskName?: string): StorageTestingFake;
}

export class StorageException extends Error {
  status: number;
  code: string;
}
export class FileNotFoundException extends StorageException {}
export class InvalidPathException extends StorageException {}
export class UnableToWriteException extends StorageException {}
export class UnableToReadException extends StorageException {}
export class UnableToDeleteException extends StorageException {}
export class UnsupportedCapabilityException extends StorageException {}

export class LocalDriver {}
export class MemoryDriver {}
export class NullDriver {}
export class S3CompatibleDriver {}
export class StoragePoolDriver {}

export class EncryptionDecorator {}
export class CompressionDecorator {}
export class ReadOnlyDecorator {}

export class StorageTestingFake extends IFilesystem {
  assertExists(path: string): Promise<void>;
  assertMissing(path: string): Promise<void>;
  assertCount(expectedCount: number, directory?: string): Promise<void>;
  assertChecksum(path: string, expectedChecksum: string, algo?: string): Promise<void>;
  assertVisibility(path: string, expectedVisibility: string): Promise<void>;
}

export class StorageServiceProvider {
  register(app: any): void;
  boot(app: any): void;
}

export const Storage: any;
