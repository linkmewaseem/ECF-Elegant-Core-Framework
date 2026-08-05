import { Facade } from "@ecfjs/core";

export class UploadFacadeClass extends Facade {
  static accessor() {
    return "upload";
  }
}

export const Upload = Facade.create(UploadFacadeClass);
export default Upload;
