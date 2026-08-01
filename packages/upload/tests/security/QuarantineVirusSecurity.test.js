import test from "node:test";
import assert from "node:assert/strict";
import UploadedFile from "../../src/core/UploadedFile.js";
import MockVirusScanner from "../../src/security/MockVirusScanner.js";
import QuarantineManager from "../../src/security/QuarantineManager.js";
import VirusScanStep from "../../src/pipeline/VirusScanStep.js";
import StorageManager from "../../../storage/src/internal/StorageManager.js";
import { VirusDetectedException } from "../../src/exceptions/UploadException.js";

test("QuarantineVirusSecurity - detects virus threat and routes to quarantine storage", async () => {
  const storageManager = new StorageManager();
  const quarantineDisk = storageManager.disk("local");
  await quarantineDisk.deleteDirectory("quarantine");

  const quarantineManager = new QuarantineManager(storageManager);
  const scanner = new MockVirusScanner();

  const infectedBuffer = Buffer.from("X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*");
  const infectedFile = new UploadedFile({
    originalName: "malware.exe",
    mimeType: "application/octet-stream",
    buffer: infectedBuffer
  });

  const step = new VirusScanStep(scanner, quarantineManager);

  await assert.rejects(async () => {
    await step.handle(infectedFile, async (f) => f);
  }, VirusDetectedException);

  const files = await quarantineDisk.allFiles("quarantine");
  assert.equal(files.length, 1);
});
