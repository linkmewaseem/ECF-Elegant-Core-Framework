import UploadPathSanitizer from "../core/UploadPathSanitizer.js";

export class SignedUploadManager {
  constructor(storageManager) {
    this.storageManager = storageManager;
  }

  async createSignedUploadUrl(fileName, options = {}) {
    const cleanName = UploadPathSanitizer.sanitize(fileName);
    const targetPath = options.path ? `${options.path}/${cleanName}` : cleanName;
    const disk = options.disk || "s3";
    const expiration = options.expirationInSeconds || 3600;

    const filesystem = this.storageManager.disk(disk);
    const uploadUrl = await filesystem.temporaryUrl(targetPath, expiration);

    return {
      uploadUrl,
      path: targetPath,
      disk,
      expiresIn: expiration,
      method: "PUT"
    };
  }
}

export default SignedUploadManager;
