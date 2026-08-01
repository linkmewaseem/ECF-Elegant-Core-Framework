export class QuarantineManager {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.quarantineDisk = "local";
  }

  async quarantine(uploadedFile, reason = "Virus threat detected") {
    const key = `quarantine/${Date.now()}_${uploadedFile.name}`;
    const filesystem = this.storageManager.disk(this.quarantineDisk);

    await filesystem.put(key, uploadedFile.buffer, { visibility: "private" });

    return {
      quarantined: true,
      quarantinePath: key,
      originalName: uploadedFile.originalName,
      reason,
      quarantinedAt: new Date()
    };
  }
}

export default QuarantineManager;
