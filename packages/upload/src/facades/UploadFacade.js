import { Facade } from "@ecf/core";

export class UploadFacadeClass extends Facade {
  static accessor() {
    return "upload";
  }
}

export const Upload = Facade.create(UploadFacadeClass);
export default Upload;
