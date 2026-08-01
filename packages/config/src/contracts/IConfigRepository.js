export class IConfigRepository {
  get(key, defaultValue = null) {
    throw new Error("Method get() must be implemented.");
  }
  set(key, value) {
    throw new Error("Method set() must be implemented.");
  }
  has(key) {
    throw new Error("Method has() must be implemented.");
  }
}

export default IConfigRepository;
