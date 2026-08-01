export class StorageException extends Error {
  constructor(message = "Storage exception.", status = 500, code = "ERR_STORAGE") {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
  }
}

export class FileNotFoundException extends StorageException {
  constructor(path, disk = "local") {
    super(`File '${path}' does not exist on disk '${disk}'.`, 404, "ERR_FILE_NOT_FOUND");
    this.path = path;
    this.disk = disk;
  }
}

export class InvalidPathException extends StorageException {
  constructor(path, reason = "Path traversal or invalid characters detected.") {
    super(`Invalid path '${path}': ${reason}`, 400, "ERR_INVALID_PATH");
    this.path = path;
  }
}

export class UnableToWriteException extends StorageException {
  constructor(path, reason = "Unknown write error.") {
    super(`Unable to write file at path '${path}': ${reason}`, 500, "ERR_UNABLE_TO_WRITE");
    this.path = path;
  }
}

export class UnableToReadException extends StorageException {
  constructor(path, reason = "Unknown read error.") {
    super(`Unable to read file at path '${path}': ${reason}`, 500, "ERR_UNABLE_TO_READ");
    this.path = path;
  }
}

export class UnableToDeleteException extends StorageException {
  constructor(path, reason = "Unknown delete error.") {
    super(`Unable to delete file at path '${path}': ${reason}`, 500, "ERR_UNABLE_TO_DELETE");
    this.path = path;
  }
}

export class UnsupportedCapabilityException extends StorageException {
  constructor(capability, driver = "unknown") {
    super(`Capability '${capability}' is not supported by driver '${driver}'.`, 400, "ERR_UNSUPPORTED_CAPABILITY");
    this.capability = capability;
    this.driver = driver;
  }
}

export default StorageException;
