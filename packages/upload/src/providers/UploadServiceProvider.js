import { ServiceProvider } from "@ecfjs/core";
import UploadManager from "../internal/UploadManager.js";

export class UploadServiceProvider extends ServiceProvider {
  register(app) {
    app.singleton("upload", (app) => {
      const uploadManager = new UploadManager(app);
      if (app.has("storage")) {
        uploadManager.setStorageManager(app.make("storage"));
      }
      return uploadManager;
    });
  }

  boot(app) {
    // Perform any boot bindings
  }
}

export default UploadServiceProvider;
