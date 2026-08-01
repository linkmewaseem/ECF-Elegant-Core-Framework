export class MediaException extends Error {
  constructor(message, { code = "MEDIA_ERROR", context = {} } = {}) {
    super(message);
    this.name = "MediaException";
    this.code = code;
    this.context = context;
  }
}

export class UnsupportedMediaTypeException extends MediaException {
  constructor(mimeType) {
    super(`Unsupported media type: ${mimeType}`, { code: "UNSUPPORTED_MEDIA_TYPE", context: { mimeType } });
    this.name = "UnsupportedMediaTypeException";
  }
}

export class MediaDriverNotFoundException extends MediaException {
  constructor(driverName) {
    super(`No driver registered for: ${driverName}`, { code: "DRIVER_NOT_FOUND", context: { driverName } });
    this.name = "MediaDriverNotFoundException";
  }
}

export class MediaProcessingException extends MediaException {
  constructor(message, cause = null) {
    super(message, { code: "PROCESSING_FAILED" });
    this.name = "MediaProcessingException";
    this.cause = cause;
  }
}

export class MediaSecurityException extends MediaException {
  constructor(message, context = {}) {
    super(message, { code: "MEDIA_SECURITY_VIOLATION", context });
    this.name = "MediaSecurityException";
  }
}

export class MediaStorageException extends MediaException {
  constructor(message, context = {}) {
    super(message, { code: "MEDIA_STORAGE_FAILED", context });
    this.name = "MediaStorageException";
  }
}

export class MediaValidationException extends MediaException {
  constructor(message, context = {}) {
    super(message, { code: "MEDIA_VALIDATION_FAILED", context });
    this.name = "MediaValidationException";
  }
}

export class ProfileNotFoundException extends MediaException {
  constructor(profileName) {
    super(`Media profile not found: ${profileName}`, { code: "PROFILE_NOT_FOUND", context: { profileName } });
    this.name = "ProfileNotFoundException";
  }
}

export class VariantNotFoundException extends MediaException {
  constructor(variantName) {
    super(`Media variant not found: ${variantName}`, { code: "VARIANT_NOT_FOUND", context: { variantName } });
    this.name = "VariantNotFoundException";
  }
}
