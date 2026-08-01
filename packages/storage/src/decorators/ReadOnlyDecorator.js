import IDriverDecorator from "../contracts/IDriverDecorator.js";
import { UnableToWriteException, UnableToDeleteException } from "../exceptions/StorageException.js";

export class ReadOnlyDecorator extends IDriverDecorator {
  name() {
    return `${this.driver.name()}:readonly`;
  }

  supports(capability) {
    return this.driver.supports(capability);
  }

  async put(path) {
    throw new UnableToWriteException(path, "Disk is configured as read-only.");
  }

  async delete(path) {
    throw new UnableToDeleteException(path, "Disk is configured as read-only.");
  }

  async copy(source, destination) {
    throw new UnableToWriteException(destination, "Disk is configured as read-only.");
  }

  async move(source, destination) {
    throw new UnableToWriteException(destination, "Disk is configured as read-only.");
  }

  async get(path) { return this.driver.get(path); }
  async exists(path) { return this.driver.exists(path); }
  async readStream(path) { return this.driver.readStream(path); }
}

export default ReadOnlyDecorator;
