export class UploadException extends Error {
  constructor(message = "Upload processing exception.", status = 400, code = "ERR_UPLOAD") {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
  }
}

export class FileValidationException extends UploadException {
  constructor(reason = "File validation failed.", errors = []) {
    super(`Upload validation failed: ${reason}`, 422, "ERR_UPLOAD_VALIDATION");
    this.errors = errors;
  }
}

export class InvalidMagicBytesException extends UploadException {
  constructor(detectedMime, claimedMime) {
    super(`File header signature '${detectedMime}' does not match claimed MIME type '${claimedMime}'.`, 422, "ERR_INVALID_MAGIC_BYTES");
    this.detectedMime = detectedMime;
    this.claimedMime = claimedMime;
  }
}

export class UploadSessionExpiredException extends UploadException {
  constructor(sessionId) {
    super(`Upload session '${sessionId}' has expired or is invalid.`, 410, "ERR_UPLOAD_SESSION_EXPIRED");
    this.sessionId = sessionId;
  }
}

export class VirusDetectedException extends UploadException {
  constructor(fileName, threatName = "Generic.Malware") {
    super(`Virus/Malware threat '${threatName}' detected in file '${fileName}'.`, 422, "ERR_VIRUS_DETECTED");
    this.fileName = fileName;
    this.threatName = threatName;
  }
}

export default UploadException;
