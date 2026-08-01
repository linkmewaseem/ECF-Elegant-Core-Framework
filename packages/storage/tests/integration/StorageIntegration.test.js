import test from "node:test";
import assert from "node:assert/strict";
import { Application } from "../../../core/src/index.js";
import StorageServiceProvider from "../../src/providers/StorageServiceProvider.js";
import StorageFacade from "../../src/facades/StorageFacade.js";

test("StorageIntegration - StorageServiceProvider IoC registration and StorageFacade binding", async () => {
  const app = new Application();
  app.register(StorageServiceProvider);
  app.boot();

  const storageManager = app.make("storage");
  assert.ok(storageManager);

  StorageFacade.setApplication(app);

  const fakeDisk = StorageFacade.fake("photos");
  await fakeDisk.put("vacation.jpg", "photo-bytes");

  await fakeDisk.assertExists("vacation.jpg");
});
