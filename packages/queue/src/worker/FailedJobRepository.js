import IFailedJobRepository from "../contracts/IFailedJobRepository.js";

export class FailedJobRepository extends IFailedJobRepository {
  constructor() {
    super();
    this.records = new Map(); // id -> failedJobRecord
  }

  async log(connection, queue, payload, exception) {
    const id = `failed_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const record = {
      id,
      connection,
      queue,
      payload,
      exception: {
        message: exception.message,
        stack: exception.stack
      },
      failedAt: new Date()
    };
    this.records.set(id, record);
    return id;
  }

  async all() {
    return Array.from(this.records.values());
  }

  async find(id) {
    return this.records.get(id) || null;
  }

  async forget(id) {
    return this.records.delete(id);
  }

  async flush() {
    this.records.clear();
    return true;
  }
}

export default FailedJobRepository;
