export class IFailedJobRepository {
  log(connection, queue, payload, exception) { throw new Error("Method not implemented."); }
  all() { throw new Error("Method not implemented."); }
  find(id) { throw new Error("Method not implemented."); }
  forget(id) { throw new Error("Method not implemented."); }
  flush() { throw new Error("Method not implemented."); }
}
export default IFailedJobRepository;
