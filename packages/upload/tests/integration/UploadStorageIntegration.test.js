import test from "node:test";
import assert from "node:assert/strict";
import { Application } from "../../../core/src/index.js";
import StorageServiceProvider from "../../../storage/src/providers/StorageServiceProvider.js";
import UploadServiceProvider from "../../src/providers/UploadServiceProvider.js";
import UploadFacade from "../../src/facades/UploadFacade.js";
import UploadedFile from "../../src/core/UploadedFile.js";

test("UploadStorageIntegration - IoC container, Facade, and storage persistence", async () => {
  const app = new Application();
  app.register(StorageServiceProvider);
  app.register(UploadServiceProvider);
  app.boot();

  UploadFacade.setApplication(app);

  const file = UploadedFile.fake("profile-picture.png", { size: 500, mime: "image/png" });

  const { file: processed, manifest } = await UploadFacade.process(file, "avatar");

  assert.ok(manifest.id);
  assert.equal(manifest.originalName, "profile-picture.png");

  const stored = await processed.store("avatars", "local");
  assert.equal(stored.path, "avatars/profile-picture.png");

  const storageManager = app.make("storage");
  assert.equal(await storageManager.disk("local").exists("avatars/profile-picture.png"), true);
});
